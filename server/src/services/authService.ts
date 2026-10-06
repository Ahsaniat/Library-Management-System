import crypto from 'crypto';
import { Op } from 'sequelize';
import config from '../config';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import { hashPassword, comparePassword, hashToken } from '../utils/helpers';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';
import { UserRole } from '../types';
import { emailService } from './emailService';
import logger from '../utils/logger';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  durationToMs,
} from '../utils/jwt';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface TokenMeta {
  ip?: string;
  userAgent?: string;
}

interface LoginResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const REFRESH_TOKEN_TTL_MS = durationToMs(config.jwt.refreshExpiresIn, 7 * 24 * 60 * 60 * 1000);

export class AuthService {
  async register(data: RegisterData): Promise<User> {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      // Self-registration can never choose a role. Admin-initiated accounts
      // use the admin-only POST /admin/users endpoint instead.
      role: UserRole.MEMBER,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: verificationExpires,
    });

    const emailSent = await emailService.sendWelcomeEmail(
      user.email,
      user.firstName,
      verificationToken
    );

    if (!emailSent) {
      logger.warn({ action: 'verification_email_failed', userId: user.id });
    }

    logger.info({ action: 'user_registered', userId: user.id });
    return user;
  }

  async login(email: string, password: string, meta: TokenMeta = {}): Promise<LoginResult> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (config.requireEmailVerification && !user.isEmailVerified) {
      throw new UnauthorizedError('Please verify your email address before signing in');
    }

    await user.update({ lastLoginAt: new Date() });

    const tokens = await this.issueTokenPair(user, meta);

    logger.info({ action: 'user_login', userId: user.id });
    return { user, ...tokens };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      where: { emailVerificationToken: hashToken(token) },
    });
    if (!user) {
      throw new ValidationError('Invalid verification token');
    }

    if (!user.emailVerificationExpires || user.emailVerificationExpires.getTime() < Date.now()) {
      throw new ValidationError('Verification token has expired');
    }

    await user.update({
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    logger.info({ action: 'email_verified', userId: user.id });
  }

  async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return 'If the email exists, a reset link has been sent';
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await user.update({
      passwordResetToken: hashToken(resetToken),
      passwordResetExpires: resetExpires,
    });

    const emailSent = await emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      resetToken
    );

    if (!emailSent) {
      logger.warn({ action: 'password_reset_email_failed', userId: user.id });
    }

    logger.info({ action: 'password_reset_requested', userId: user.id });
    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      where: {
        passwordResetToken: hashToken(token),
        passwordResetExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);
    await user.update({
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    await this.revokeUserSessions(user.id);

    logger.info({ action: 'password_reset', userId: user.id });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new ValidationError('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password: hashedPassword });

    await this.revokeUserSessions(user.id);

    logger.info({ action: 'password_changed', userId: user.id });
  }

  /**
   * Rotates a refresh token: the presented token is revoked and a new pair is
   * issued. Presenting an already-revoked token is treated as theft, and every
   * active session for that user is revoked.
   */
  async rotateRefreshToken(rawToken: string, meta: TokenMeta = {}): Promise<LoginResult> {
    let decoded;
    try {
      decoded = verifyRefreshToken(rawToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const tokenHash = this.hashToken(rawToken);
    const stored = await RefreshToken.findOne({ where: { tokenHash } });

    if (!stored) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (stored.revokedAt) {
      await this.revokeUserSessions(stored.userId);
      logger.warn({ action: 'refresh_token_reuse_detected', userId: stored.userId });
      throw new UnauthorizedError('Refresh token reuse detected; all sessions revoked');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      await stored.update({ revokedAt: new Date() });
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = await User.findByPk(stored.userId);
    if (!user || !user.isActive || user.tokenVersion !== decoded.tokenVersion) {
      throw new UnauthorizedError('Session is no longer valid');
    }

    await stored.update({ revokedAt: new Date() });
    const tokens = await this.issueTokenPair(user, meta);

    logger.info({ action: 'refresh_token_rotated', userId: user.id });
    return { user, ...tokens };
  }

  /** Revokes a single refresh token. Idempotent by design (logout must not fail). */
  async revokeRefreshToken(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await RefreshToken.findOne({ where: { tokenHash } });

    if (stored && !stored.revokedAt) {
      await stored.update({ revokedAt: new Date() });
      logger.info({ action: 'refresh_token_revoked', userId: stored.userId });
    }
  }

  /** Revokes every active session for a user and invalidates outstanding access tokens. */
  async revokeUserSessions(userId: string): Promise<void> {
    await RefreshToken.update(
      { revokedAt: new Date() },
      { where: { userId, revokedAt: null } }
    );

    const user = await User.findByPk(userId);
    if (user) {
      await user.update({ tokenVersion: user.tokenVersion + 1 });
    }
  }

  private async issueTokenPair(
    user: User,
    meta: TokenMeta
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const subject = {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = signAccessToken(subject);
    const refreshToken = signRefreshToken(subject);

    await RefreshToken.create({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const authService = new AuthService();

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
import config from '../config';
import User from '../models/User';
import { hashPassword, comparePassword } from '../utils/helpers';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';
import { UserRole } from '../types';
import logger from '../utils/logger';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

interface LoginResult {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<User> {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: data.role ?? UserRole.MEMBER,
      emailVerificationToken: verificationToken,
    });

    logger.info({ action: 'user_registered', userId: user.id, email: user.email });
    return user;
  }

  async login(email: string, password: string): Promise<LoginResult> {
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

    await user.update({ lastLoginAt: new Date() });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.info({ action: 'user_login', userId: user.id });
    return { user, accessToken, refreshToken };
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({ where: { emailVerificationToken: token } });
    if (!user) {
      throw new ValidationError('Invalid verification token');
    }

    await user.update({
      isEmailVerified: true,
      emailVerificationToken: undefined,
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
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    logger.info({ action: 'password_reset_requested', userId: user.id });
    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await User.findOne({
      where: {
        passwordResetToken: token,
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

    logger.info({ action: 'password_changed', userId: user.id });
  }

  async refreshTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await User.findByPk(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  private generateAccessToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }

  private generateRefreshToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );
  }
}

export const authService = new AuthService();

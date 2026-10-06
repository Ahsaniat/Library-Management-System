import { Request, Response, NextFunction, CookieOptions } from 'express';
import { authService, auditService } from '../services';
import { ApiResponse } from '../types';
import config from '../config';
import { durationToMs } from '../utils/jwt';
import { toUserDto } from '../utils/dto';
import { NotFoundError } from '../utils/errors';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';

function refreshCookieBaseOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
  };
}

function refreshCookieOptions(): CookieOptions {
  return {
    ...refreshCookieBaseOptions(),
    maxAge: durationToMs(config.jwt.refreshExpiresIn, 7 * 24 * 60 * 60 * 1000),
  };
}

/** Non-browser API clients may opt in to receiving the refresh token in the body. */
function wantsBodyRefreshToken(req: Request): boolean {
  return req.get('x-refresh-token-transport') === 'body';
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.register({
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
      });
      const response: ApiResponse = {
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: { user: toUserDto(user) },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions());
      await auditService.record({
        userId: result.user.id,
        action: 'auth.login',
        entityType: 'User',
        entityId: result.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });
      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: toUserDto(result.user),
          accessToken: result.accessToken,
          ...(wantsBodyRefreshToken(req) && { refreshToken: result.refreshToken }),
        },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.params.token as string;
      await authService.verifyEmail(token);
      const response: ApiResponse = {
        success: true,
        message: 'Email verified successfully',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      const response: ApiResponse = {
        success: true,
        message: 'If the email exists, a reset link has been sent',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      const response: ApiResponse = {
        success: true,
        message: 'Password reset successful',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.id, currentPassword, newPassword);
      await auditService.record({
        userId: req.user?.id,
        action: 'auth.password_changed',
        entityType: 'User',
        entityId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });
      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.rotateRefreshToken(req.refreshTokenRaw!, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions());
      const response: ApiResponse = {
        success: true,
        data: {
          user: toUserDto(result.user),
          accessToken: result.accessToken,
          ...(wantsBodyRefreshToken(req) && { refreshToken: result.refreshToken }),
        },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.refreshTokenRaw) {
        await authService.revokeRefreshToken(req.refreshTokenRaw);
      }
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieBaseOptions());
      const response: ApiResponse = {
        success: true,
        message: 'Logged out successfully',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { User } = await import('../models');
      const user = await User.findByPk(req.user!.id);

      if (!user) {
        throw new NotFoundError('User');
      }

      const response: ApiResponse = {
        success: true,
        data: { user: toUserDto(user) },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { User } = await import('../models');
      const user = await User.findByPk(req.user!.id);
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found',
          requestId: req.requestId,
        };
        res.status(404).json(response);
        return;
      }

      const { firstName, lastName, phone, address } = req.body;
      
      await user.update({
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      });

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully',
        data: { user: toUserDto(user) },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

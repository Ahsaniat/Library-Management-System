import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { User, Loan } from '../models';
import { authService, auditService } from '../services';
import { ApiResponse, UserRole, LoanStatus } from '../types';
import { NotFoundError, ForbiddenError, ValidationError, ConflictError } from '../utils/errors';
import { calculatePagination } from '../utils/helpers';
import { toUserDto } from '../utils/dto';
import logger from '../utils/logger';
import bcrypt from 'bcryptjs';

interface UserSearchParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export class AdminController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, role, search } = req.query as unknown as UserSearchParams;
      const offset = (Number(page) - 1) * Number(limit);

      const where: Record<string, unknown> = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where[Op.or as unknown as string] = [
          { email: { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows, count } = await User.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
      });

      const response: ApiResponse = {
        success: true,
        data: calculatePagination(
          rows.map((user) => toUserDto(user)),
          count,
          { page: Number(page), limit: Number(limit) }
        ),
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, role = UserRole.MEMBER } = req.body as CreateUserData;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new ValidationError('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        isActive: true,
        isEmailVerified: true,
      });

      logger.info({
        action: 'admin_user_created',
        adminId: req.user?.id,
        userId: user.id,
        role,
      });

      await auditService.record({
        userId: req.user?.id,
        action: 'user.created',
        entityType: 'User',
        entityId: user.id,
        newValues: { email: user.email, role: user.role },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });

      const response: ApiResponse = {
        success: true,
        message: 'User created successfully',
        data: { user: toUserDto(user) },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id as string;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
      });

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

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.body as { role: string };
      const userId = req.params.id as string;

      if (userId === req.user?.id) {
        throw new ForbiddenError('Cannot change your own role');
      }

      if (!Object.values(UserRole).includes(role as UserRole)) {
        throw new ForbiddenError('Invalid role');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      const previousRole = user.role;
      await user.update({ role: role as UserRole });

      logger.info({
        action: 'user_role_updated',
        adminId: req.user?.id,
        userId,
        newRole: role,
      });

      await auditService.record({
        userId: req.user?.id,
        action: 'user.role_updated',
        entityType: 'User',
        entityId: userId,
        oldValues: { role: previousRole },
        newValues: { role },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });

      const response: ApiResponse = {
        success: true,
        message: 'User role updated',
        data: { user: toUserDto(user) },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isActive } = req.body as { isActive: boolean };
      const userId = req.params.id as string;

      if (userId === req.user?.id) {
        throw new ForbiddenError('Cannot deactivate your own account');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      await user.update({ isActive });

      if (!isActive) {
        await authService.revokeUserSessions(userId);
      }

      logger.info({
        action: 'user_status_updated',
        adminId: req.user?.id,
        userId,
        isActive,
      });

      await auditService.record({
        userId: req.user?.id,
        action: 'user.status_updated',
        entityType: 'User',
        entityId: userId,
        newValues: { isActive },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });

      const response: ApiResponse = {
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'}`,
        data: { user: toUserDto(user) },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id as string;

      if (userId === req.user?.id) {
        throw new ForbiddenError('Cannot delete your own account');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      const activeLoans = await Loan.count({
        where: { userId, status: LoanStatus.ACTIVE },
      });

      if (activeLoans > 0) {
        throw new ConflictError('Cannot delete a user with active loans');
      }

      await authService.revokeUserSessions(userId);
      await user.destroy();

      logger.info({
        action: 'user_deleted',
        adminId: req.user?.id,
        userId,
      });

      await auditService.record({
        userId: req.user?.id,
        action: 'user.deleted',
        entityType: 'User',
        entityId: userId,
        oldValues: { email: user.email, role: user.role },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });

      const response: ApiResponse = {
        success: true,
        message: 'User deleted',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();

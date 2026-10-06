import { Request, Response, NextFunction } from 'express';
import { settingService, auditService } from '../services';
import { ApiResponse } from '../types';
import { NotFoundError } from '../utils/errors';

export class SettingController {
  async getPublicSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await settingService.list(true);
      const response: ApiResponse = {
        success: true,
        data: { settings },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async listSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await settingService.list(false);
      const response: ApiResponse = {
        success: true,
        data: { settings },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const key = req.params.key as string;
      const { value } = req.body as { value: string };
      const settings = await settingService.list(false);
      const exists = settings.some((setting) => setting.key === key);

      if (!exists) {
        throw new NotFoundError('Setting');
      }

      const setting = await settingService.upsert(key, String(value));
      await auditService.record({
        userId: req.user?.id,
        action: 'setting.updated',
        entityType: 'Setting',
        entityId: setting.id,
        newValues: { key, value: String(value) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });
      const response: ApiResponse = {
        success: true,
        message: 'Setting updated',
        data: { setting },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const settingController = new SettingController();

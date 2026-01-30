import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services';
import { ApiResponse } from '../types';

export class NotificationController {
  async getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { unreadOnly, limit, offset } = req.query;
      const result = await notificationService.getUserNotifications(req.user!.id, {
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });
      
      const response: ApiResponse = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAsRead(req.params.id as string, req.user!.id);
      const response: ApiResponse = {
        success: true,
        message: 'Notification marked as read',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      const response: ApiResponse = {
        success: true,
        message: 'All notifications marked as read',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.delete(req.params.id as string, req.user!.id);
      const response: ApiResponse = {
        success: true,
        message: 'Notification deleted',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();

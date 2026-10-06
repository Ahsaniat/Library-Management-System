import { Request, Response, NextFunction } from 'express';
import { fineService, auditService } from '../services';
import { ApiResponse, FineStatus } from '../types';
import { calculatePagination, readPagination } from '../utils/helpers';

export class FineController {
  async getMyFines(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = readPagination(req.query as Record<string, unknown>);
      const { rows, count } = await fineService.getUserFines(req.user!.id, pagination);
      const response: ApiResponse = {
        success: true,
        data: {
          fines: rows,
          pagination: calculatePagination(rows, count, pagination),
        },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const outstanding = await fineService.getOutstandingTotal(req.user!.id);
      const response: ApiResponse = {
        success: true,
        data: { outstanding },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllFines(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as FineStatus | undefined;
      const userId = req.query.userId as string | undefined;
      const pagination = readPagination(req.query as Record<string, unknown>);
      const { rows, count } = await fineService.getAllFines({ status, userId }, pagination);
      const response: ApiResponse = {
        success: true,
        data: {
          fines: rows,
          pagination: calculatePagination(rows, count, pagination),
        },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async payFine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, method, transactionId, notes } = req.body;
      const { fine, payment } = await fineService.pay(req.params.id as string, {
        amount,
        method,
        transactionId,
        notes,
        processedBy: req.user!.id,
      });
      await auditService.record({
        userId: req.user?.id,
        action: 'fine.paid',
        entityType: 'Fine',
        entityId: fine.id,
        newValues: { amount, method, receiptNumber: payment.receiptNumber },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });
      const response: ApiResponse = {
        success: true,
        message: 'Payment recorded',
        data: { fine, payment },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async waiveFine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = req.body;
      const fine = await fineService.waive(
        req.params.id as string,
        reason,
        req.user!.id
      );
      await auditService.record({
        userId: req.user?.id,
        action: 'fine.waived',
        entityType: 'Fine',
        entityId: fine.id,
        newValues: { reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });
      const response: ApiResponse = {
        success: true,
        message: 'Fine waived',
        data: { fine },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const fineController = new FineController();

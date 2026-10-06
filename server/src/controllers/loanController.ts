import { Request, Response, NextFunction } from 'express';
import { loanService, auditService } from '../services';
import { ApiResponse, LoanStatus } from '../types';
import { calculatePagination, readPagination } from '../utils/helpers';

export class LoanController {
  async selfCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loan = await loanService.selfCheckout({
        bookId: req.body.bookId,
        userId: req.user!.id,
      });
      await auditService.record({
        userId: req.user?.id,
        action: 'loan.self_checkout',
        entityType: 'Loan',
        entityId: loan.id,
        newValues: { bookId: req.body.bookId },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });
      const response: ApiResponse = {
        success: true,
        message: 'Book borrowed successfully',
        data: { loan },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loan = await loanService.checkout({
        ...req.body,
        librarianId: req.user?.id,
      });
      await auditService.record({
        userId: req.user?.id,
        action: 'loan.checked_out',
        entityType: 'Loan',
        entityId: loan.id,
        newValues: { userId: req.body.userId },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });
      const response: ApiResponse = {
        success: true,
        message: 'Book checked out successfully',
        data: { loan },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async checkin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookCopyId, barcode, notes } = req.body;
      const result = await loanService.checkin({ bookCopyId, barcode }, req.user?.id, notes);
      await auditService.record({
        userId: req.user?.id,
        action: 'loan.checked_in',
        entityType: 'Loan',
        entityId: result.loan.id,
        newValues: { fine: result.fine?.amount },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        requestId: req.requestId,
      });
      const response: ApiResponse = {
        success: true,
        message: result.fine
          ? `Book returned with fine of $${result.fine.amount}`
          : 'Book returned successfully',
        data: result,
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async renew(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loan = await loanService.renew(req.params.loanId as string, req.user!.id);
      const response: ApiResponse = {
        success: true,
        message: 'Loan renewed successfully',
        data: { loan },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getOverdue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = readPagination(req.query as Record<string, unknown>);
      const { rows, count } = await loanService.getOverdueLoans(pagination);
      const response: ApiResponse = {
        success: true,
        data: { loans: rows, pagination: calculatePagination(rows, count, pagination) },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.params.userId as string) ?? req.user!.id;
      const status = req.query.status as LoanStatus | undefined;
      const pagination = readPagination(req.query as Record<string, unknown>);
      const { rows, count } = await loanService.getUserLoans(userId, status, pagination);
      const response: ApiResponse = {
        success: true,
        data: { loans: rows, pagination: calculatePagination(rows, count, pagination) },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMyLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as LoanStatus | undefined;
      const pagination = readPagination(req.query as Record<string, unknown>);
      const { rows, count } = await loanService.getUserLoans(req.user!.id, status, pagination);
      const response: ApiResponse = {
        success: true,
        data: { loans: rows, pagination: calculatePagination(rows, count, pagination) },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const loanController = new LoanController();

import { Request, Response, NextFunction } from 'express';
import { loanService } from '../services';
import { ApiResponse, LoanStatus } from '../types';

export class LoanController {
  async checkout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loan = await loanService.checkout({
        ...req.body,
        librarianId: req.user?.id,
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
      const { bookCopyId, notes } = req.body;
      const result = await loanService.checkin(bookCopyId, req.user?.id, notes);
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
      const loans = await loanService.getOverdueLoans();
      const response: ApiResponse = {
        success: true,
        data: { loans },
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
      const loans = await loanService.getUserLoans(userId, status);
      const response: ApiResponse = {
        success: true,
        data: { loans },
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
      const loans = await loanService.getUserLoans(req.user!.id, status);
      const response: ApiResponse = {
        success: true,
        data: { loans },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const loanController = new LoanController();

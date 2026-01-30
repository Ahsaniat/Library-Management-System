import { Request, Response, NextFunction } from 'express';
import { bookRequestService } from '../services';
import { BookRequestStatus } from '../models/BookRequest';
import { ApiResponse } from '../types';

export class BookRequestController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await bookRequestService.create({
        userId: req.user!.id,
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        reason: req.body.reason,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Book request submitted successfully',
        data: { request },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await bookRequestService.getUserRequests(req.user!.id);

      const response: ApiResponse = {
        success: true,
        data: { requests },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as BookRequestStatus | undefined;
      const requests = await bookRequestService.getAllRequests(status);

      const response: ApiResponse = {
        success: true,
        data: { requests },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await bookRequestService.getById(req.params.id as string);

      const response: ApiResponse = {
        success: true,
        data: { request },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async process(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await bookRequestService.process(req.params.id as string, {
        status: req.body.status,
        adminNotes: req.body.adminNotes,
        processedBy: req.user!.id,
      });

      const response: ApiResponse = {
        success: true,
        message: `Book request ${req.body.status}`,
        data: { request },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await bookRequestService.cancel(req.params.id as string, req.user!.id);

      const response: ApiResponse = {
        success: true,
        message: 'Book request cancelled',
        data: { request },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const bookRequestController = new BookRequestController();

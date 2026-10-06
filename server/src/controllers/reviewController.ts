import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services';
import { ApiResponse, UserRole } from '../types';
import { calculatePagination, readPagination } from '../utils/helpers';

export class ReviewController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.create({
        bookId: req.params.id as string,
        userId: req.user!.id,
        rating: req.body.rating,
        title: req.body.title,
        content: req.body.content,
      });
      const response: ApiResponse = {
        success: true,
        message: 'Review submitted',
        data: { review },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async listByBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = readPagination(req.query as Record<string, unknown>, 20);
      const { rows, count } = await reviewService.listByBook(
        req.params.id as string,
        pagination
      );
      const response: ApiResponse = {
        success: true,
        data: {
          reviews: rows,
          pagination: calculatePagination(rows, count, pagination),
        },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await reviewService.remove(
        req.params.id as string,
        req.user!.id,
        req.user!.role === UserRole.ADMIN
      );
      const response: ApiResponse = {
        success: true,
        message: 'Review deleted',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();

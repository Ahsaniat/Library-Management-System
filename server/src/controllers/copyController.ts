import { Request, Response, NextFunction } from 'express';
import { copyService } from '../services';
import { ApiResponse } from '../types';
import { calculatePagination, readPagination } from '../utils/helpers';

export class CopyController {
  async listByBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookId = req.query.bookId as string;
      const pagination = readPagination(req.query as Record<string, unknown>);
      const { rows, count } = await copyService.listByBook(bookId, pagination);
      const response: ApiResponse = {
        success: true,
        data: {
          copies: rows,
          pagination: calculatePagination(rows, count, pagination),
        },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const copy = await copyService.create(req.body);
      const response: ApiResponse = {
        success: true,
        message: 'Copy added',
        data: { copy },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const copy = await copyService.update(req.params.id as string, req.body);
      const response: ApiResponse = {
        success: true,
        message: 'Copy updated',
        data: { copy },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await copyService.remove(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        message: 'Copy removed',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const copyController = new CopyController();

import { Request, Response, NextFunction } from 'express';
import { libraryService } from '../services';
import { ApiResponse } from '../types';

export class LibraryController {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const libraries = await libraryService.list();
      const response: ApiResponse = {
        success: true,
        data: { libraries },
        requestId: _req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const library = await libraryService.getById(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        data: { library },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const library = await libraryService.create(req.body);
      const response: ApiResponse = {
        success: true,
        message: 'Library created',
        data: { library },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const library = await libraryService.update(req.params.id as string, req.body);
      const response: ApiResponse = {
        success: true,
        message: 'Library updated',
        data: { library },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await libraryService.remove(req.params.id as string);
      const response: ApiResponse = {
        success: true,
        message: 'Library deleted',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const libraryController = new LibraryController();

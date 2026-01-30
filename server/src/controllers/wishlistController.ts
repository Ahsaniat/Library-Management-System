import { Request, Response, NextFunction } from 'express';
import { wishlistService } from '../services';
import { ApiResponse } from '../types';

export class WishlistController {
  async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await wishlistService.add({
        userId: req.user!.id,
        bookId: req.body.bookId,
        notes: req.body.notes,
        priority: req.body.priority,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Book added to wishlist',
        data: { item },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await wishlistService.remove(req.user!.id, req.params.bookId as string);

      const response: ApiResponse = {
        success: true,
        message: 'Book removed from wishlist',
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMyWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await wishlistService.getUserWishlist(req.user!.id);

      const response: ApiResponse = {
        success: true,
        data: { items },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async checkInWishlist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inWishlist = await wishlistService.isInWishlist(req.user!.id, req.params.bookId as string);

      const response: ApiResponse = {
        success: true,
        data: { inWishlist },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updatePriority(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await wishlistService.updatePriority(
        req.user!.id,
        req.params.bookId as string,
        req.body.priority
      );

      const response: ApiResponse = {
        success: true,
        message: 'Priority updated',
        data: { item },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateNotes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await wishlistService.updateNotes(
        req.user!.id,
        req.params.bookId as string,
        req.body.notes
      );

      const response: ApiResponse = {
        success: true,
        message: 'Notes updated',
        data: { item },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const wishlistController = new WishlistController();

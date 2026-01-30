import { Request, Response, NextFunction } from 'express';
import { reservationService } from '../services';
import { ApiResponse } from '../types';

export class ReservationController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservation = await reservationService.create({
        bookId: req.body.bookId,
        userId: req.user!.id,
      });
      const response: ApiResponse = {
        success: true,
        message: 'Reservation created successfully',
        data: { reservation },
        requestId: req.requestId,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservation = await reservationService.cancel(
        req.params.id as string,
        req.user!.id,
        req.body.reason as string | undefined
      );
      const response: ApiResponse = {
        success: true,
        message: 'Reservation cancelled successfully',
        data: { reservation },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getMyReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservations = await reservationService.getUserReservations(req.user!.id);
      const response: ApiResponse = {
        success: true,
        data: { reservations },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getBookReservations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reservations = await reservationService.getBookReservations(req.params.bookId as string);
      const response: ApiResponse = {
        success: true,
        data: { reservations },
        requestId: req.requestId,
      };
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const reservationController = new ReservationController();

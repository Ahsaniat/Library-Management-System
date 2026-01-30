import { Router } from 'express';
import { reservationController } from '../controllers';
import { authenticate, authorize, validate } from '../middleware';
import {
  createReservationValidator,
  reservationIdValidator,
  cancelReservationValidator,
} from '../validators';
import { UserRole } from '../types';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(createReservationValidator),
  reservationController.create.bind(reservationController)
);

router.get(
  '/my',
  authenticate,
  reservationController.getMyReservations.bind(reservationController)
);

router.post(
  '/:id/cancel',
  authenticate,
  validate(cancelReservationValidator),
  reservationController.cancel.bind(reservationController)
);

router.get(
  '/book/:bookId',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  reservationController.getBookReservations.bind(reservationController)
);

export default router;

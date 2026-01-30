import { Router } from 'express';
import { bookRequestController } from '../controllers';
import { authenticate, authorize } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.post(
  '/',
  authenticate,
  bookRequestController.create.bind(bookRequestController)
);

router.get(
  '/my',
  authenticate,
  bookRequestController.getMyRequests.bind(bookRequestController)
);

router.post(
  '/:id/cancel',
  authenticate,
  bookRequestController.cancel.bind(bookRequestController)
);

router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  bookRequestController.getAllRequests.bind(bookRequestController)
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  bookRequestController.getById.bind(bookRequestController)
);

router.post(
  '/:id/process',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  bookRequestController.process.bind(bookRequestController)
);

export default router;

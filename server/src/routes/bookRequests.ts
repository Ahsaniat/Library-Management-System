import { Router } from 'express';
import { bookRequestController } from '../controllers';
import { authenticate, authorize, validate } from '../middleware';
import {
  createBookRequestValidator,
  bookRequestIdValidator,
  processBookRequestValidator,
  bookRequestSearchValidator,
} from '../validators';
import { UserRole } from '../types';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(createBookRequestValidator),
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
  validate(bookRequestIdValidator),
  bookRequestController.cancel.bind(bookRequestController)
);

router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(bookRequestSearchValidator),
  bookRequestController.getAllRequests.bind(bookRequestController)
);

router.get(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(bookRequestIdValidator),
  bookRequestController.getById.bind(bookRequestController)
);

router.post(
  '/:id/process',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(processBookRequestValidator),
  bookRequestController.process.bind(bookRequestController)
);

export default router;

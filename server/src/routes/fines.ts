import { Router } from 'express';
import { fineController } from '../controllers';
import { authenticate, authorize, validate } from '../middleware';
import {
  payFineValidator,
  waiveFineValidator,
  fineSearchValidator,
  finePaginationValidator,
} from '../validators';
import { UserRole } from '../types';

const router = Router();

router.get(
  '/my',
  authenticate,
  validate(finePaginationValidator),
  fineController.getMyFines.bind(fineController)
);

router.get(
  '/summary/my',
  authenticate,
  fineController.getMySummary.bind(fineController)
);

router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(fineSearchValidator),
  fineController.getAllFines.bind(fineController)
);

router.post(
  '/:id/pay',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(payFineValidator),
  fineController.payFine.bind(fineController)
);

router.post(
  '/:id/waive',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(waiveFineValidator),
  fineController.waiveFine.bind(fineController)
);

export default router;

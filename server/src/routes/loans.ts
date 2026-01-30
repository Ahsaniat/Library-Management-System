import { Router } from 'express';
import { loanController } from '../controllers';
import { authenticate, authorize, validate } from '../middleware';
import {
  checkoutValidator,
  checkinValidator,
  renewValidator,
  loanSearchValidator,
} from '../validators';
import { UserRole } from '../types';

const router = Router();

router.post(
  '/self-checkout',
  authenticate,
  loanController.selfCheckout.bind(loanController)
);

router.post(
  '/checkout',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(checkoutValidator),
  loanController.checkout.bind(loanController)
);

router.post(
  '/checkin',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(checkinValidator),
  loanController.checkin.bind(loanController)
);

router.post(
  '/:loanId/renew',
  authenticate,
  validate(renewValidator),
  loanController.renew.bind(loanController)
);

router.get(
  '/overdue',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  loanController.getOverdue.bind(loanController)
);

router.get(
  '/my',
  authenticate,
  validate(loanSearchValidator),
  loanController.getMyLoans.bind(loanController)
);

router.get(
  '/user/:userId',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(loanSearchValidator),
  loanController.getUserLoans.bind(loanController)
);

export default router;

import { Router } from 'express';
import { copyController } from '../controllers';
import { authenticate, authorize, validate } from '../middleware';
import {
  copyIdValidator,
  copyListValidator,
  createCopyValidator,
  updateCopyValidator,
} from '../validators';
import { UserRole } from '../types';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(copyListValidator),
  copyController.listByBook.bind(copyController)
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(createCopyValidator),
  copyController.create.bind(copyController)
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(updateCopyValidator),
  copyController.update.bind(copyController)
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(copyIdValidator),
  copyController.remove.bind(copyController)
);

export default router;

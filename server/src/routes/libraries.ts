import { Router } from 'express';
import { libraryController } from '../controllers';
import { authenticate, authorize, validate } from '../middleware';
import {
  libraryIdValidator,
  createLibraryValidator,
  updateLibraryValidator,
} from '../validators';
import { UserRole } from '../types';

const router = Router();

router.get('/', libraryController.list.bind(libraryController));

router.get(
  '/:id',
  validate(libraryIdValidator),
  libraryController.getById.bind(libraryController)
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createLibraryValidator),
  libraryController.create.bind(libraryController)
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateLibraryValidator),
  libraryController.update.bind(libraryController)
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(libraryIdValidator),
  libraryController.remove.bind(libraryController)
);

export default router;

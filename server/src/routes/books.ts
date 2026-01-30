import { Router } from 'express';
import { bookController } from '../controllers';
import { authenticate, authorize, validate, optionalAuth } from '../middleware';
import {
  createBookValidator,
  updateBookValidator,
  bookIdValidator,
  bookSearchValidator,
} from '../validators';
import { UserRole } from '../types';

const router = Router();

router.get(
  '/',
  optionalAuth,
  validate(bookSearchValidator),
  bookController.search.bind(bookController)
);

router.get(
  '/popular',
  bookController.getPopular.bind(bookController)
);

router.get(
  '/recent',
  bookController.getRecent.bind(bookController)
);

router.get(
  '/isbn/:isbn',
  bookController.lookupIsbn.bind(bookController)
);

router.get(
  '/openlibrary/search',
  bookController.searchOpenLibrary.bind(bookController)
);

router.get(
  '/:id',
  optionalAuth,
  validate(bookIdValidator),
  bookController.getById.bind(bookController)
);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(createBookValidator),
  bookController.create.bind(bookController)
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(updateBookValidator),
  bookController.update.bind(bookController)
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(bookIdValidator),
  bookController.delete.bind(bookController)
);

export default router;

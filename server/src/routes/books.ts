import { Router } from 'express';
import { bookController, reviewController } from '../controllers';
import { authenticate, authorize, validate, optionalAuth } from '../middleware';
import {
  createBookValidator,
  updateBookValidator,
  bookIdValidator,
  bookSearchValidator,
  createReviewValidator,
  reviewSearchValidator,
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
  '/categories',
  bookController.getCategories.bind(bookController)
);

router.get(
  '/:id/reviews',
  validate(reviewSearchValidator),
  reviewController.listByBook.bind(reviewController)
);

router.post(
  '/:id/reviews',
  authenticate,
  validate(createReviewValidator),
  reviewController.create.bind(reviewController)
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

router.patch(
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

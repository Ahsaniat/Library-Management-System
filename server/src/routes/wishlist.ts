import { Router } from 'express';
import { wishlistController } from '../controllers';
import { authenticate, optionalAuth, validate } from '../middleware';
import {
  addToWishlistValidator,
  wishlistBookIdValidator,
  updateWishlistPriorityValidator,
  updateWishlistNotesValidator,
} from '../validators';

const router = Router();

router.post(
  '/',
  authenticate,
  validate(addToWishlistValidator),
  wishlistController.add.bind(wishlistController)
);

router.get(
  '/my',
  authenticate,
  wishlistController.getMyWishlist.bind(wishlistController)
);

router.get(
  '/check/:bookId',
  optionalAuth,
  validate(wishlistBookIdValidator),
  wishlistController.checkInWishlist.bind(wishlistController)
);

router.delete(
  '/:bookId',
  authenticate,
  validate(wishlistBookIdValidator),
  wishlistController.remove.bind(wishlistController)
);

router.patch(
  '/:bookId/priority',
  authenticate,
  validate(updateWishlistPriorityValidator),
  wishlistController.updatePriority.bind(wishlistController)
);

router.patch(
  '/:bookId/notes',
  authenticate,
  validate(updateWishlistNotesValidator),
  wishlistController.updateNotes.bind(wishlistController)
);

export default router;

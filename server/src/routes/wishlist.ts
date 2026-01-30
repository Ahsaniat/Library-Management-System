import { Router } from 'express';
import { wishlistController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.post(
  '/',
  authenticate,
  wishlistController.add.bind(wishlistController)
);

router.get(
  '/my',
  authenticate,
  wishlistController.getMyWishlist.bind(wishlistController)
);

router.get(
  '/check/:bookId',
  authenticate,
  wishlistController.checkInWishlist.bind(wishlistController)
);

router.delete(
  '/:bookId',
  authenticate,
  wishlistController.remove.bind(wishlistController)
);

router.patch(
  '/:bookId/priority',
  authenticate,
  wishlistController.updatePriority.bind(wishlistController)
);

router.patch(
  '/:bookId/notes',
  authenticate,
  wishlistController.updateNotes.bind(wishlistController)
);

export default router;

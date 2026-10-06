import { Router } from 'express';
import { reviewController } from '../controllers';
import { authenticate, validate } from '../middleware';
import { reviewIdValidator } from '../validators';

const router = Router();

router.delete(
  '/:id',
  authenticate,
  validate(reviewIdValidator),
  reviewController.remove.bind(reviewController)
);

export default router;

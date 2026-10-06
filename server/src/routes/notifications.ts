import { Router } from 'express';
import { notificationController } from '../controllers';
import { authenticate, validate } from '../middleware';
import { notificationIdValidator, notificationSearchValidator } from '../validators';

const router = Router();

router.get(
  '/',
  authenticate,
  validate(notificationSearchValidator),
  notificationController.getMyNotifications.bind(notificationController)
);

router.post(
  '/mark-all-read',
  authenticate,
  notificationController.markAllAsRead.bind(notificationController)
);

router.post(
  '/:id/read',
  authenticate,
  validate(notificationIdValidator),
  notificationController.markAsRead.bind(notificationController)
);

router.delete(
  '/:id',
  authenticate,
  validate(notificationIdValidator),
  notificationController.deleteNotification.bind(notificationController)
);

export default router;

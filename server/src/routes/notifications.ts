import { Router } from 'express';
import { notificationController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

router.get(
  '/',
  authenticate,
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
  notificationController.markAsRead.bind(notificationController)
);

router.delete(
  '/:id',
  authenticate,
  notificationController.deleteNotification.bind(notificationController)
);

export default router;

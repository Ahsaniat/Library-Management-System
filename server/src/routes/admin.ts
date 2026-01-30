import { Router } from 'express';
import { authenticate, authorize, validate } from '../middleware';
import { UserRole } from '../types';
import { adminController } from '../controllers';

const router = Router();

router.get(
  '/users',
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.listUsers.bind(adminController)
);

router.post(
  '/users',
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.createUser.bind(adminController)
);

router.get(
  '/users/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.getUser.bind(adminController)
);

router.patch(
  '/users/:id/role',
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.updateUserRole.bind(adminController)
);

router.patch(
  '/users/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.updateUserStatus.bind(adminController)
);

router.delete(
  '/users/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  adminController.deleteUser.bind(adminController)
);

export default router;

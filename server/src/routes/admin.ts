import { Router } from 'express';
import { authenticate, authorize, validate } from '../middleware';
import { UserRole } from '../types';
import { adminController } from '../controllers';
import {
  createUserValidator,
  updateUserRoleValidator,
  updateUserStatusValidator,
  userIdValidator,
  adminUserSearchValidator,
} from '../validators';

const router = Router();

router.get(
  '/users',
  authenticate,
  // Librarians run the circulation desk and need member lookup; mutations
  // below remain admin-only.
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(adminUserSearchValidator),
  adminController.listUsers.bind(adminController)
);

router.post(
  '/users',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createUserValidator),
  adminController.createUser.bind(adminController)
);

router.get(
  '/users/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  validate(userIdValidator),
  adminController.getUser.bind(adminController)
);

router.patch(
  '/users/:id/role',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateUserRoleValidator),
  adminController.updateUserRole.bind(adminController)
);

router.patch(
  '/users/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateUserStatusValidator),
  adminController.updateUserStatus.bind(adminController)
);

router.delete(
  '/users/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(userIdValidator),
  adminController.deleteUser.bind(adminController)
);

export default router;

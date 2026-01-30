import { Router } from 'express';
import { authController } from '../controllers';
import { authenticate, refreshTokens, validate, authLimiter } from '../middleware';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} from '../validators';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate(registerValidator),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  validate(loginValidator),
  authController.login.bind(authController)
);

router.get(
  '/verify-email/:token',
  authController.verifyEmail.bind(authController)
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordValidator),
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordValidator),
  authController.resetPassword.bind(authController)
);

router.post(
  '/refresh-token',
  refreshTokens,
  authController.refreshToken.bind(authController)
);

router.get(
  '/profile',
  authenticate,
  authController.getProfile.bind(authController)
);

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordValidator),
  authController.changePassword.bind(authController)
);

export default router;

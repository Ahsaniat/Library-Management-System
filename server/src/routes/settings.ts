import { Router } from 'express';
import { settingController } from '../controllers';
import { authenticate, authorize, validate } from '../middleware';
import { updateSettingValidator } from '../validators';
import { UserRole } from '../types';

const router = Router();

router.get('/public', settingController.getPublicSettings.bind(settingController));

router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  settingController.listSettings.bind(settingController)
);

router.put(
  '/:key',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(updateSettingValidator),
  settingController.updateSetting.bind(settingController)
);

export default router;

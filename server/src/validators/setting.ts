import { body, param } from 'express-validator';

export const updateSettingValidator = [
  param('key')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid setting key'),
  body('value')
    .exists()
    .withMessage('Setting value is required')
    .isString()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Setting value is too long'),
];

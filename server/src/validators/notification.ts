import { param, query } from 'express-validator';

export const notificationIdValidator = [
  param('id').isUUID().withMessage('Invalid notification ID'),
];

export const notificationSearchValidator = [
  query('unreadOnly').optional().isBoolean().toBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('offset').optional().isInt({ min: 0 }).toInt(),
];

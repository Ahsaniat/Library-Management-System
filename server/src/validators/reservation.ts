import { body, param, query } from 'express-validator';

export const createReservationValidator = [
  body('bookId')
    .isUUID()
    .withMessage('Valid book ID is required'),
];

export const reservationIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid reservation ID'),
];

export const reservationSearchValidator = [
  query('userId')
    .optional()
    .isUUID(),
  query('bookId')
    .optional()
    .isUUID(),
  query('status')
    .optional()
    .isIn(['pending', 'ready', 'fulfilled', 'cancelled', 'expired']),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt(),
];

export const cancelReservationValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid reservation ID'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }),
];

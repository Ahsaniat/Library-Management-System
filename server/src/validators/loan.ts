import { body, param, query } from 'express-validator';

export const checkoutValidator = [
  body('bookCopyId')
    .isUUID()
    .withMessage('Valid book copy ID is required'),
  body('userId')
    .isUUID()
    .withMessage('Valid user ID is required'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
];

export const checkinValidator = [
  body('bookCopyId')
    .isUUID()
    .withMessage('Valid book copy ID is required'),
  body('condition')
    .optional()
    .isIn(['new', 'good', 'fair', 'poor', 'damaged'])
    .withMessage('Invalid condition value'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }),
];

export const renewValidator = [
  param('loanId')
    .isUUID()
    .withMessage('Valid loan ID is required'),
];

export const loanIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid loan ID'),
];

export const loanSearchValidator = [
  query('userId')
    .optional()
    .isUUID(),
  query('status')
    .optional()
    .isIn(['active', 'returned', 'overdue', 'lost']),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt(),
  query('overdue')
    .optional()
    .isBoolean()
    .toBoolean(),
];

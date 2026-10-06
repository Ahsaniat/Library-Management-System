import { body, param, query } from 'express-validator';

const copyReferenceValidator = [
  body('bookCopyId')
    .optional()
    .isUUID()
    .withMessage('bookCopyId must be a valid UUID'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Invalid barcode'),
  body().custom((_value, { req }) => {
    if (!req.body.bookCopyId && !req.body.barcode) {
      throw new Error('Either bookCopyId or barcode is required');
    }
    return true;
  }),
];

export const selfCheckoutValidator = [
  body('bookId').isUUID().withMessage('Valid book ID is required'),
];

export const checkoutValidator = [
  ...copyReferenceValidator,
  body('userId')
    .isUUID()
    .withMessage('Valid user ID is required'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  body('overrideHold')
    .optional()
    .isBoolean()
    .toBoolean()
    .withMessage('overrideHold must be a boolean'),
];

export const checkinValidator = [
  ...copyReferenceValidator,
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

import { body, param, query } from 'express-validator';

export const fineIdValidator = [param('id').isUUID().withMessage('Invalid fine ID')];

export const payFineValidator = [
  ...fineIdValidator,
  body('amount')
    .isFloat({ min: 0.01, max: 100000 })
    .withMessage('Amount must be between 0.01 and 100000')
    .toFloat(),
  body('method')
    .isIn(['cash', 'card', 'online', 'other'])
    .withMessage('Invalid payment method'),
  body('transactionId').optional().trim().isLength({ max: 100 }),
  body('notes').optional().trim().isLength({ max: 500 }),
];

export const waiveFineValidator = [
  ...fineIdValidator,
  body('reason')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('A waiver reason is required'),
];

export const fineSearchValidator = [
  query('status')
    .optional()
    .isIn(['pending', 'paid', 'waived', 'partial'])
    .withMessage('Invalid fine status'),
  query('userId').optional().isUUID(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const finePaginationValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

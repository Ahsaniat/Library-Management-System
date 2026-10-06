import { body, param, query } from 'express-validator';

export const createBookRequestValidator = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Title is required'),
  body('author').optional().trim().isLength({ max: 255 }),
  body('isbn').optional().trim().isLength({ min: 10, max: 17 }),
  body('reason').optional().trim().isLength({ max: 2000 }),
];

export const bookRequestIdValidator = [param('id').isUUID().withMessage('Invalid request ID')];

export const processBookRequestValidator = [
  ...bookRequestIdValidator,
  body('status')
    .isIn(['approved', 'rejected', 'acquired'])
    .withMessage('Invalid status'),
  body('adminNotes').optional().trim().isLength({ max: 2000 }),
];

export const bookRequestSearchValidator = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'acquired', 'cancelled'])
    .withMessage('Invalid status filter'),
];

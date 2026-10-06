import { body, param, query } from 'express-validator';

const COPY_CONDITIONS = ['new', 'good', 'fair', 'poor'];

export const copyIdValidator = [param('id').isUUID().withMessage('Invalid copy ID')];

export const copyListValidator = [
  query('bookId').isUUID().withMessage('bookId is required'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const createCopyValidator = [
  body('bookId').isUUID().withMessage('Valid book ID is required'),
  body('barcode').optional().trim().isLength({ min: 1, max: 50 }),
  body('condition').optional().isIn(COPY_CONDITIONS),
  body('location').optional().trim().isLength({ max: 100 }),
  body('shelf').optional().trim().isLength({ max: 50 }),
  body('section').optional().trim().isLength({ max: 50 }),
  body('floor').optional().trim().isLength({ max: 20 }),
  body('notes').optional().trim().isLength({ max: 1000 }),
  body('libraryId').optional().isUUID(),
];

export const updateCopyValidator = [
  ...copyIdValidator,
  body('status')
    .optional()
    .isIn(['available', 'borrowed', 'reserved', 'maintenance', 'lost', 'damaged'])
    .withMessage('Invalid copy status'),
  body('condition').optional().isIn(COPY_CONDITIONS),
  body('location').optional().trim().isLength({ max: 100 }),
  body('shelf').optional().trim().isLength({ max: 50 }),
  body('section').optional().trim().isLength({ max: 50 }),
  body('floor').optional().trim().isLength({ max: 20 }),
  body('notes').optional().trim().isLength({ max: 1000 }),
  body('libraryId').optional().isUUID(),
];

import { body, param } from 'express-validator';

export const wishlistBookIdValidator = [param('bookId').isUUID().withMessage('Invalid book ID')];

export const addToWishlistValidator = [
  body('bookId').isUUID().withMessage('Valid book ID is required'),
  body('notes').optional().trim().isLength({ max: 2000 }),
  body('priority')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Priority must be between 0 and 1000')
    .toInt(),
];

export const updateWishlistPriorityValidator = [
  ...wishlistBookIdValidator,
  body('priority')
    .isInt({ min: 0, max: 1000 })
    .withMessage('Priority must be between 0 and 1000')
    .toInt(),
];

export const updateWishlistNotesValidator = [
  ...wishlistBookIdValidator,
  body('notes').trim().isLength({ max: 2000 }),
];

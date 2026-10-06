import { body, param, query } from 'express-validator';

export const createReviewValidator = [
  param('id').isUUID().withMessage('Invalid book ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
    .toInt(),
  body('title').optional().trim().isLength({ max: 255 }),
  body('content').optional().trim().isLength({ max: 5000 }),
];

export const reviewIdValidator = [param('id').isUUID().withMessage('Invalid review ID')];

export const reviewSearchValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

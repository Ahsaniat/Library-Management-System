import { body, param, query } from 'express-validator';

export const createBookValidator = [
  body('isbn')
    .trim()
    .isLength({ min: 10, max: 17 })
    .withMessage('Valid ISBN is required'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Title is required'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  body('description')
    .optional()
    .trim(),
  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid published year'),
  body('edition')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('language')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('pageCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page count must be positive'),
  body('authorId')
    .optional()
    .isUUID()
    .withMessage('Invalid author ID'),
  body('publisherId')
    .optional()
    .isUUID()
    .withMessage('Invalid publisher ID'),
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID'),
  body('numberOfCopies')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of copies must be non-negative'),
];

export const updateBookValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid book ID'),
  body('isbn')
    .optional()
    .trim()
    .isLength({ min: 10, max: 17 }),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 }),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 500 }),
  body('description')
    .optional()
    .trim(),
  body('publishedYear')
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 }),
  body('edition')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('language')
    .optional()
    .trim()
    .isLength({ max: 50 }),
  body('pageCount')
    .optional()
    .isInt({ min: 1 }),
  body('authorId')
    .optional()
    .isUUID(),
  body('publisherId')
    .optional()
    .isUUID(),
  body('categoryId')
    .optional()
    .isUUID(),
  body('numberOfCopies')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of copies must be non-negative'),
];

export const bookIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid book ID'),
];

export const bookSearchValidator = [
  query('q')
    .optional()
    .trim()
    .isLength({ max: 200 }),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt(),
  query('category')
    .optional()
    .isUUID(),
  query('author')
    .optional()
    .isUUID(),
  query('year')
    .optional()
    .isInt({ min: 1000 }),
  query('available')
    .optional()
    .isBoolean()
    .toBoolean(),
];

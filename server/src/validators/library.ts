import { body, param } from 'express-validator';

export const libraryIdValidator = [param('id').isUUID().withMessage('Invalid library ID')];

export const createLibraryValidator = [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
  body('code').trim().isLength({ min: 1, max: 20 }).withMessage('Code is required'),
  body('address').optional().trim().isLength({ max: 1000 }),
  body('city').optional().trim().isLength({ max: 100 }),
  body('state').optional().trim().isLength({ max: 100 }),
  body('country').optional().trim().isLength({ max: 100 }),
  body('zipCode').optional().trim().isLength({ max: 20 }),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('website').optional().trim().isLength({ max: 500 }),
  body('openingHours').optional().trim().isLength({ max: 2000 }),
  body('isMain').optional().isBoolean().toBoolean(),
  body('isActive').optional().isBoolean().toBoolean(),
];

export const updateLibraryValidator = [
  ...libraryIdValidator,
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('code').optional().trim().isLength({ min: 1, max: 20 }),
  body('address').optional().trim().isLength({ max: 1000 }),
  body('city').optional().trim().isLength({ max: 100 }),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('openingHours').optional().trim().isLength({ max: 2000 }),
  body('isMain').optional().isBoolean().toBoolean(),
  body('isActive').optional().isBoolean().toBoolean(),
];

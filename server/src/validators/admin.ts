import { body, param, query } from 'express-validator';
import { UserRole } from '../types';

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain uppercase, lowercase, and number');

export const createUserValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  passwordRule,
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required'),
  body('role')
    .optional()
    .isIn(Object.values(UserRole))
    .withMessage('Invalid role'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
];

export const updateUserRoleValidator = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('role').isIn(Object.values(UserRole)).withMessage('Invalid role'),
];

export const updateUserStatusValidator = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean').toBoolean(),
];

export const userIdValidator = [param('id').isUUID().withMessage('Invalid user ID')];

export const adminUserSearchValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('role').optional().isIn(Object.values(UserRole)).withMessage('Invalid role filter'),
  query('search').optional().trim().isLength({ max: 200 }),
];

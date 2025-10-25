// Napa/Varun
import { body, validationResult } from 'express-validator';

import {
  PASSWORD_MIN_LENGTH,
  DIFFICULTY_LEVELS,
  USER_ROLES,
} from './constants.js';

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// Registration validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn([USER_ROLES.STUDENT, USER_ROLES.EXAMINER])
    .withMessage('Invalid role'),
];

// Login validation rules
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),

  body('password').notEmpty().withMessage('Password is required'),
];

// Exam creation validation
const examCreationValidation = [
  body('title').trim().notEmpty().withMessage('Exam title is required'),

  body('topic').trim().notEmpty().withMessage('Topic is required'),

  body('difficulty')
    .notEmpty()
    .withMessage('Difficulty level is required')
    .isIn([
      DIFFICULTY_LEVELS.EASY,
      DIFFICULTY_LEVELS.MEDIUM,
      DIFFICULTY_LEVELS.HARD,
    ])
    .withMessage('Invalid difficulty level'),

  body('totalQuestions')
    .notEmpty()
    .withMessage('Number of questions is required')
    .isInt({ min: 5, max: 50 })
    .withMessage('Number of questions must be between 5 and 50'),

  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 10, max: 180 })
    .withMessage('Duration must be between 10 and 180 minutes'),
];

export {
  validate,
  registerValidation,
  loginValidation,
  examCreationValidation,
};

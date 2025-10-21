// Suvarna
import express from 'express';
import  {
  register,
  login,
  logout,
  getProfile,
} from '../controllers/authController.js';

import  {
  registerValidation,
  loginValidation,
  validate,
} from '../utils/validators.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

export default router;

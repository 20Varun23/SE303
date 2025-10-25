// Suvarna
import jwt from 'jsonwebtoken';
import { USER_ROLES } from '../utils/constants.js';

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

const isExaminer = (req, res, next) => {
  if (req.user.role !== USER_ROLES.EXAMINER) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Examiner role required.',
    });
  }
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== USER_ROLES.STUDENT) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student role required.',
    });
  }
  next();
};

export {
  authenticate,
  isExaminer,
  isStudent,
};

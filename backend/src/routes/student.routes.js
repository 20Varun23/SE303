import express from 'express';

import {
  getAvailableExams,
  startExam,
  submitAnswer,
  submitExam,
  getMyResults,
  getExamResult,
  getExamReview,
  getRemainingTime,
  getActiveAttempt,
} from '../controllers/studentController.js';

import { authenticate, isStudent } from '../middleware/auth.js';

const router = express.Router();
// All routes require authentication and student role
router.use(authenticate, isStudent);

// Get all published exams
router.get('/exams', getAvailableExams);

// Start an exam attempt
router.post('/exams/:examId/start', startExam);

// Submit answer for a question
router.post('/answers', submitAnswer);

// Submit entire exam
router.post('/attempts/:attemptId/submit', submitExam);

// Get all my results
router.get('/results', getMyResults);

// Get result for specific exam
router.get('/exams/:examId/result', getExamResult);

// Get detailed review of completed exam
router.get('/attempts/:attemptId/review', getExamReview);

// Get remaining time for ongoing exam
router.get('/attempts/:attemptId/time', getRemainingTime);

router.get('/exams/:examId/active', getActiveAttempt);

export default router;

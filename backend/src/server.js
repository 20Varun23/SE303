// ALL
import dotenv from 'dotenv';
dotenv.config();

import express, { json, urlencoded } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import examinerRoutes from './routes/examiner.routes.js';
import studentRoutes from './routes/student.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(json());
app.use(urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'AI MCQ Exam System API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/examiner', examinerRoutes);
app.use('/api/student', studentRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

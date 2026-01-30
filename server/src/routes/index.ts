import { Router, Request, Response } from 'express';
import authRoutes from './auth';
import bookRoutes from './books';
import loanRoutes from './loans';
import reservationRoutes from './reservations';
import { ApiResponse } from '../types';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Library Management System API is running',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    },
  };
  res.json(response);
});

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/loans', loanRoutes);
router.use('/reservations', reservationRoutes);

export default router;

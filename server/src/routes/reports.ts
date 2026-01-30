import { Router } from 'express';
import { reportController } from '../controllers';
import { authenticate, authorize } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  reportController.getDashboard.bind(reportController)
);

router.get(
  '/circulation',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  reportController.getCirculationStats.bind(reportController)
);

router.get(
  '/books',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  reportController.getBookStats.bind(reportController)
);

router.get(
  '/users',
  authenticate,
  authorize(UserRole.ADMIN),
  reportController.getUserStats.bind(reportController)
);

router.get(
  '/financial',
  authenticate,
  authorize(UserRole.ADMIN),
  reportController.getFinancialStats.bind(reportController)
);

router.get(
  '/overdue',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  reportController.getOverdueReport.bind(reportController)
);

router.get(
  '/inventory',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  reportController.getInventoryReport.bind(reportController)
);

export default router;

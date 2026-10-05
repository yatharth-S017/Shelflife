import { Router } from 'express';
import authRoutes from './auth.routes';
import bookRoutes from './book.routes';
import memberRoutes from './member.routes';
import borrowRoutes from './borrow.routes';
import { returnBook } from '../controllers/borrow.controller';
import { authenticateLibrarian } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/members', memberRoutes);
router.use('/borrow', borrowRoutes);

// Explicit alias for POST /api/return/:borrowId as specified in Q1 b)
router.post('/return/:borrowId', authenticateLibrarian, returnBook);

export default router;

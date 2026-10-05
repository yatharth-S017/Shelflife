import { Router } from 'express';
import { issueBook, returnBook } from '../controllers/borrow.controller';
import { authenticateLibrarian } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { issueBookSchema } from '../validators';

const router = Router();

// Route: POST /api/borrow (Issue book) - Protected
router.post('/', authenticateLibrarian, validateRequest(issueBookSchema), issueBook);

// Route: POST /api/return/:borrowId (Return book) - Protected
router.post('/return/:borrowId', authenticateLibrarian, returnBook);

export default router;

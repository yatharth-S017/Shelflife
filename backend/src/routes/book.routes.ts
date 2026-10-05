import { Router } from 'express';
import { addBook, getBooks } from '../controllers/book.controller';
import { authenticateLibrarian } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createBookSchema } from '../validators';

const router = Router();

router.get('/', getBooks);
router.post('/', authenticateLibrarian, validateRequest(createBookSchema), addBook);

export default router;

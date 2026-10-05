import { Router } from 'express';
import { login } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { loginSchema } from '../validators';

const router = Router();

router.post('/login', validateRequest(loginSchema), login);

export default router;

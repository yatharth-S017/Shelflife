import { Router } from 'express';
import { registerMember, getMembers, getMemberHistory } from '../controllers/member.controller';
import { authenticateLibrarian } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createMemberSchema } from '../validators';

const router = Router();

router.get('/', getMembers);
router.post('/', authenticateLibrarian, validateRequest(createMemberSchema), registerMember);
router.get('/:id/history', getMemberHistory);

export default router;

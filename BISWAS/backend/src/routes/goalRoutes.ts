import { Router } from 'express';
import { getGoals, createGoal } from '../controllers/goal.Controller';
import { checkJwt } from '../middleware/authMiddleware';

const router = Router();

// Protect all goal routes with checkJwt
router.use(checkJwt);

router.get('/', getGoals);
router.post('/', createGoal);

export default router;
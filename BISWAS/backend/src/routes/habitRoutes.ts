import { Router } from 'express';
import { createHabit, checkInHabit, deleteHabit } from '../controllers/habit.Controller';
import { checkJwt } from '../middleware/authMiddleware';

const router = Router();

// Apply checkJwt middleware globally to all habit routes
router.use(checkJwt);

// Create a habit (Requires goal_id in the body)
router.post('/', createHabit);

// Log a check-in for a specific habit (e.g., /api/habits/123/log)
router.post('/:id/log', checkInHabit);

router.delete('/:id', deleteHabit);
export default router;
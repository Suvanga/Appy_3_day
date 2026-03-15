import { Router } from 'express';
// Add deleteGoal to this import!
import { getGoals, createGoal, deleteGoal, updateGoal } from '../controllers/goal.Controller'; 
import { checkJwt } from '../middleware/authMiddleware';

const router = Router();

router.use(checkJwt);

router.get('/', getGoals);
router.post('/', createGoal);
// Add the new delete route!
router.delete('/:id', deleteGoal); 

router.put('/:id', updateGoal);

export default router;
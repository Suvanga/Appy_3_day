import { Router } from 'express';
import { 
  createOrGetUser, 
  deleteUser, 
  getCurrentUser, 
  updateUser 
} from '../controllers/user.Controller';
import { checkJwt } from '../middleware/authMiddleware';


const router = Router();

// Route: POST /api/users
// Description: Receives user data from frontend to login or register
router.post('/', checkJwt, createOrGetUser);
router.delete('/:auth0_id', checkJwt, deleteUser);
router.get('/me', checkJwt, getCurrentUser);
router.put('/me', checkJwt, updateUser);


export default router;
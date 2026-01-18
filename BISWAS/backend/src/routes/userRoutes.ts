import { Router } from 'express';
import { createOrGetUser } from '../controllers/user.Controller';
import { deleteUser } from '../controllers/user.Controller';
const router = Router();

// Route: POST /api/users
// Description: Receives user data from frontend to login or register
router.post('/', createOrGetUser);
router.delete('/:auth0_id', deleteUser);

export default router;
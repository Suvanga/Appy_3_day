import { Router } from 'express';
import { generateInsight, getInsights } from '../controllers/insight.Controller';
import { checkJwt } from '../middleware/authMiddleware';

const router = Router();

// Secure all AI routes
router.use(checkJwt);

// Route to fetch past insights
router.get('/', getInsights);

// Route to trigger Gemini and generate a new one
router.get('/generate', generateInsight); 

export default router;

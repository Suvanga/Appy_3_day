import express from 'express';
import cors from 'cors'; 
import userRoutes from './routes/userRoutes';
import goalRoutes from './routes/goalRoutes'; 
import habitRoutes from './routes/habitRoutes'; 
import insightRoutes from './routes/insightRoutes';


const app = express();

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON bodies

// Routes firs one is user routes, 
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes); 
app.use('/api/habits', habitRoutes); 
app.use('/api/insights', insightRoutes);

export default app;
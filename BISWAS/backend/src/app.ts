import express from 'express';
import cors from 'cors'; // You might need to install this: npm install cors
import userRoutes from './routes/userRoutes';
import goalRoutes from './routes/goalRoutes'; 
import habitRoutes from './routes/habitRoutes'; // <-- 1. Add this import


const app = express();

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON bodies

// Routes firs one is user routes, 
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes); 
app.use('/api/habits', habitRoutes); // <-- 2. Register the new route

export default app;
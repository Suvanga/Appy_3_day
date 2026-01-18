import express from 'express';
import cors from 'cors'; // You might need to install this: npm install cors
import userRoutes from './routes/userRoutes';

const app = express();

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON bodies

// Routes
// This means any route in 'userRoutes' will start with '/api/users'
app.use('/api/users', userRoutes);

export default app;
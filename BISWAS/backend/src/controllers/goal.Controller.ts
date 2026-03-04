import { Request, Response } from 'express';
import prisma from '../config/db'; // Make sure this path is correct for your app

// GET /api/goals
export const getGoals = async (req: Request, res: Response): Promise<void> => {
  try {
    // The Auth0 ID comes from the checkJwt middleware
    const auth0Id = req.auth?.payload.sub;

    if (!auth0Id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find the internal User ID first
    const user = await prisma.user.findUnique({
      where: { auth0_id: auth0Id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Fetch goals and include the associated habits
    const goals = await prisma.goal.findMany({
      where: { user_id: user.id },
      include: { habits: true },
    });

    res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
// POST /api/goals
export const createGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload.sub;
    
    // Just grab the title, ignore the description for now!
    const { title } = req.body;

    if (!auth0Id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { auth0_id: auth0Id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newGoal = await prisma.goal.create({
      data: {
        user_id: user.id,
        title,
        target_value: 100, // Default to 100% 
      },
    });

    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
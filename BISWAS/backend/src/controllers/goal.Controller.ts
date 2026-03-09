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
    // Inside getGoals...
    const goals = await prisma.goal.findMany({
      where: { user_id: user.id },
      include: { 
        habits: {
          include: { logs: true } // <-- ADD THIS LINE! This tells Prisma to fetch the check-ins too.
        } 
      },
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
    const { title, description } = req.body; 

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
        description: description || null,
        target_value: 100, // Default to 100% 
      },
    });

    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// DELETE /api/goals/:id
export const deleteGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const goalId = req.params.id;

    console.log(`\n🚨 ATTEMPTING TO DELETE GOAL: ${goalId}`);
    console.log(`User Auth0 ID making request: ${auth0Id}`);

    if (!auth0Id) {
      console.log("❌ Failed: Unauthorized (No Auth0 ID)");
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { auth0_id: auth0Id } });
    if (!user) {
      console.log("❌ Failed: User not found in database");
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const goal = await prisma.goal.findFirst({
      where: { id: goalId, user_id: user.id }
    });

    if (!goal) {
      console.log("❌ Failed: Goal doesn't exist or belongs to someone else");
      res.status(404).json({ error: 'Goal not found or does not belong to user' });
      return;
    }

    console.log("✅ Goal found! Deleting associated habits and logs...");
    
    const habits = await prisma.habit.findMany({ where: { goal_id: goalId } });
    const habitIds = habits.map(h => h.id);

    await prisma.habitLog.deleteMany({ where: { habit_id: { in: habitIds } } });
    await prisma.habit.deleteMany({ where: { goal_id: goalId } });
    await prisma.goal.delete({ where: { id: goalId } });

    console.log("✅ Successfully deleted everything!");
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('❌ CRITICAL ERROR during deletion:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
import { Request, Response } from 'express';
import  prisma  from '../config/db';

// POST /api/habits
// Creates a new habit attached to a specific goal
export const createHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const { goal_id, name, description, type, frequency } = req.body; 

    if (!auth0Id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Verify the user exists
    const user = await prisma.user.findUnique({
      where: { auth0_id: auth0Id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 2. Verify the goal exists AND belongs to this user
    const goal = await prisma.goal.findFirst({
      where: { 
        id: goal_id,
        user_id: user.id 
      },
    });

    if (!goal) {
      res.status(404).json({ error: 'Goal not found or does not belong to user' });
      return;
    }

    // 3. Create the Habit
    const newHabit = await prisma.habit.create({
      data: {
        goal_id,
        name,
        description: description || null,
        type: type || 'growth',
        frequency: frequency || 'daily',
        impact_score: 1, // Default impact score
      },
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /api/habits/:id/log
// Creates a check-in (HabitLog) for a specific habit
// POST /api/habits/:id/log
export const checkInHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const habit_id = req.params.id;
    // We added progress_made to the incoming request body
    const { status, friction_rating, friction_note, date, progress_made } = req.body;

    if (!auth0Id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const habit = await prisma.habit.findUnique({
      where: { id: habit_id },
      include: { goal: true }
    });

    const user = await prisma.user.findUnique({ where: { auth0_id: auth0Id }});
    if (!habit || !user || habit.goal.user_id !== user.id) {
      res.status(403).json({ error: 'Forbidden: You do not own this habit' });
      return;
    }

    // Create the Habit Log with the user's custom progress
    const habitLog = await prisma.habitLog.create({
      data: {
        habit_id,
        status: status ?? true,
        friction_rating: friction_rating || null,
        friction_note: friction_note || null,
        date: date ? new Date(date) : new Date(),
        progress_made: progress_made ? parseInt(progress_made) : 1, // Default to 1 if they don't specify
      },
    });

    res.status(201).json(habitLog);
  } catch (error) {
    console.error('Error logging habit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// DELETE /api/habits/:id
export const deleteHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const habit_id = req.params.id;

    if (!auth0Id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Find the habit and its associated user
    const habit = await prisma.habit.findUnique({
      where: { id: habit_id },
      include: { goal: true }
    });

    const user = await prisma.user.findUnique({ where: { auth0_id: auth0Id }});

    if (!habit || !user || habit.goal.user_id !== user.id) {
      res.status(403).json({ error: 'Forbidden: You do not own this habit' });
      return;
    }

    // 2. Delete the habit (Prisma will automatically delete associated logs if you have onCascade delete set)
    await prisma.habit.delete({
      where: { id: habit_id },
    });

    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// PUT /api/habits/:id
export const updateHabit = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const habitId = req.params.id;
    const { name, type } = req.body;

    if (!auth0Id) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const user = await prisma.user.findUnique({ where: { auth0_id: auth0Id } });
    const existingHabit = await prisma.habit.findUnique({ where: { id: habitId }, include: { goal: true } });

    if (!user || !existingHabit || existingHabit.goal.user_id !== user.id) {
      res.status(403).json({ error: 'Forbidden' }); return;
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: { name, type }
    });
    res.status(200).json(updatedHabit);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
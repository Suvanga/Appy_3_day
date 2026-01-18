import { Request, Response } from 'express';
import prisma from '../config/db';

// FUNCTION: Create a User (or return existing one if they log in again)
export const createOrGetUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { auth0_id, email } = req.body;

    if (!auth0_id || !email) {
      return res.status(400).json({ error: "auth0_id and email are required" });
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { auth0_id },
    });

    if (existingUser) {
      console.log("User already exists, logging in...");
      return res.status(200).json(existingUser);
    }

    // 2. If not, create a new user
    console.log("Creating new user...");
    const newUser = await prisma.user.create({
      data: {
        auth0_id,
        email,
      },
    });

    return res.status(201).json(newUser);

  } catch (error) {
    console.error("Error in createOrGetUser:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ... (keep your existing imports and createOrGetUser function)

// FUNCTION: Delete a User by auth0_id
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { auth0_id } = req.params;

    if (!auth0_id) {
      return res.status(400).json({ error: "auth0_id is required" });
    }

    // Try to delete the user
    await prisma.user.delete({
      where: { auth0_id },
    });

    return res.status(200).json({ message: "User deleted successfully" });

  } catch (error: any) {
    // Prisma error code P2025 means "Record to delete does not exist"
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
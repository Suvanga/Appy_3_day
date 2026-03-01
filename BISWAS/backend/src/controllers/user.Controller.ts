import { Request, Response } from 'express';
import prisma from '../config/db'; // Make sure this path is correct for your app

export const createOrGetUser = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Get the securely verified ID from the Auth0 token
    const auth0_id = (req as any).auth?.payload.sub;

    if (!auth0_id) {
      return res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
    }

    // 2. Email comes from the frontend body
    const { email } = req.body;

    // Notice the error message is different now!
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    // 3. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { auth0_id },
    });

    if (existingUser) {
      console.log("User already exists, logging in...");
      return res.status(200).json(existingUser);
    }

    // 4. If not, create a new user
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

// FUNCTION: Delete a User by auth0_id
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Get the securely verified ID from the Auth0 token
    const token_auth0_id = (req as any).auth?.payload.sub;

    if (!token_auth0_id) {
      return res.status(401).json({ error: "Unauthorized: Invalid or missing token" });
    }

    // 2. Get the ID from the URL
    const { auth0_id } = req.params;

    if (!auth0_id) {
      return res.status(400).json({ error: "auth0_id is required in the URL" });
    }

    // 3. SECURITY CHECK: Make sure the user is deleting THEIR OWN account
    if (auth0_id !== token_auth0_id) {
      return res.status(403).json({ error: "Forbidden: You can only delete your own account" });
    }

    // 4. Try to delete the user using the safely verified token ID
    await prisma.user.delete({
      where: { auth0_id: token_auth0_id }, 
    });

    return res.status(200).json({ message: "User/ deleted successfully, hope you choose this app again :)" });

  } catch (error: any) {
    // Prisma error code P2025 means "Record to delete does not exist"
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "User not found" });
    }
    
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// FUNCTION: Get current logged-in user
export const getCurrentUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const auth0_id = (req as any).auth?.payload.sub;

    if (!auth0_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { auth0_id },
      // Optional: You can easily include their habits/goals here later!
      // include: { goals: true } 
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// FUNCTION: Update current logged-in user
export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const auth0_id = (req as any).auth?.payload.sub;

    if (!auth0_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Grab the fields the user wants to update from the body
    const { name } = req.body; 

    const updatedUser = await prisma.user.update({
      where: { auth0_id },
      data: {
        name: name // Add any other profile fields here later
      }
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
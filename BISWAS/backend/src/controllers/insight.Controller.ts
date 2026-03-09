import { Request, Response } from 'express';
import prisma from '../config/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// GET /api/insights/generate
export const generateInsight = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload.sub;
    
    if (!auth0Id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 1. Find the User
    const user = await prisma.user.findUnique({ where: { auth0_id: auth0Id } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 2. Gather all context from the database
    const goals = await prisma.goal.findMany({
      where: { user_id: user.id },
      include: { 
        habits: {
          include: { logs: true } 
        } 
      },
    });

    if (goals.length === 0) {
      res.status(400).json({ error: 'Not enough data to generate insights. Add some goals first!' });
      return;
    }

    const userDataString = JSON.stringify(goals, null, 2);
    
    const prompt = `
      You are an expert, highly motivational habit coach and productivity mentor.
      Analyze this user's raw habit data:
      ${userDataString}
      
      Provide three distinct, highly encouraging coaching insights based on their real data. 
      Make them feel confident, happy, and hyped about their progress!
      
      You MUST return exactly and ONLY a valid JSON object with the following three keys. Do not include markdown formatting like \`\`\`json. Just the raw JSON object.
      {
        "patternRecognition": "A motivational insight about their daily/weekly patterns. (e.g., 'You are a Tuesday rockstar!') Keep under 2 sentences.",
        "growthMomentum": "An energetic insight celebrating their progress, streaks, or impact. Keep under 2 sentences.",
        "optimalTiming": "A smart, encouraging suggestion about timing, friction, or when they perform best. Keep under 2 sentences."
      }
    `;

    console.log("🧠 Sending data to Gemini...");

    // 4. Call Gemini 2.5 Flash AND Force JSON Output
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Clean the response just in case Gemini tries to add markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    console.log("✨ Insight generated successfully! Raw output:", text);    
    
    const newInsight = await prisma.aIInsight.create({
      data: {
        user_id: user.id,
        insight_text: text,
        context_tags: ['gemini-2.5-flash'] // Updated tag to 2.5!
      }
    });

    res.status(200).json(newInsight);

  } catch (error) {
    console.error(' Error generating insight:', error);
    res.status(500).json({ error: 'Failed to generate AI insight' });
  }
};

// GET /api/insights
// Fetches past insights for the dashboard
export const getInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload.sub;
    const user = await prisma.user.findUnique({ where: { auth0_id: auth0Id as string } });
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const insights = await prisma.aIInsight.findMany({
      where: { user_id: user.id },
      orderBy: { generated_at: 'desc' },
      take: 10 // Get the 10 most recent
    });

    res.status(200).json(insights);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
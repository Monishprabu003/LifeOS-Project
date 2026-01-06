import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { AIService } from '../services/AIService';

export const getInsight = async (req: AuthRequest, res: Response) => {
    try {
        const insight = await AIService.getDailyInsight(req.user);
        res.json({ insight });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const chatWithAI = async (req: AuthRequest, res: Response) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        const response = await AIService.chat(req.user, message);
        res.json({ response });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

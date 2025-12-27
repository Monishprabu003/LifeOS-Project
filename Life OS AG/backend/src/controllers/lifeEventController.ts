import { Response } from 'express';
import { Kernel } from '../services/Kernel';
import { AuthRequest } from '../middleware/authMiddleware';
import LifeEvent from '../models/LifeEvent';
import User from '../models/User';

export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const eventData = req.body;
        const userId = req.user._id;

        const event = await Kernel.processEvent(userId, eventData);
        res.status(201).json(event);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getEvents = async (req: AuthRequest, res: Response) => {
    try {
        const events = await LifeEvent.find({ userId: req.user._id }).sort({ timestamp: -1 });
        res.json(events);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getLifeStatus = async (req: AuthRequest, res: Response) => {
    try {
        await Kernel.updateLifeScores(req.user._id);
        const updatedUser = await User.findById(req.user._id).select('-password');
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        res.json({
            lifeScore: updatedUser.lifeScore,
            healthScore: updatedUser.healthScore,
            wealthScore: updatedUser.wealthScore,
            habitScore: updatedUser.habitScore,
            goalScore: updatedUser.goalScore,
            relationshipScore: updatedUser.relationshipScore,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

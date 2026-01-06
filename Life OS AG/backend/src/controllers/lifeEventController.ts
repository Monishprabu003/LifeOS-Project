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

export const deleteEvent = async (req: AuthRequest, res: Response) => {
    try {
        const event = await LifeEvent.findById(req.params.id);
        if (!event || event.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check for associated source data in metadata and delete it
        if (event.metadata) {
            const metadata = event.metadata as any;

            // Handle Health Logs
            if (metadata.get('logId')) {
                const HealthLog = (await import('../models/HealthLog')).default;
                await HealthLog.findByIdAndDelete(metadata.get('logId'));
            }

            // Handle Transactions
            if (metadata.get('transactionId')) {
                const Finance = (await import('../models/Finance')).default;
                await Finance.findByIdAndDelete(metadata.get('transactionId'));
            }

            // Handle Goal Rollback
            if (metadata.get('goalId')) {
                const Goal = (await import('../models/Goal')).default;
                await Goal.findByIdAndUpdate(metadata.get('goalId'), {
                    status: 'in-progress',
                    progress: 90
                });
            }

            // Handle Habit Rollback
            if (metadata.get('habitId')) {
                const Habit = (await import('../models/Habit')).default;
                const habit = await Habit.findById(metadata.get('habitId'));
                if (habit && habit.history.length > 0) {
                    habit.history.pop();
                    habit.streak = Math.max(0, habit.streak - 1);
                    const lastComp = habit.history[habit.history.length - 1];
                    const h = habit as any;
                    h.lastCompleted = lastComp ? lastComp.date : null;
                    await h.save();
                }
            }
        }

        await LifeEvent.findByIdAndDelete(req.params.id);

        // Recalculate scores (some events might affect scores)
        await Kernel.updateLifeScores(req.user._id as string);

        res.json({ message: 'Event deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAllData = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        // Import all models dynamically to avoid circular dependencies if any, 
        // but here we can just import them at the top or here.
        const HealthLog = (await import('../models/HealthLog')).default;
        const Finance = (await import('../models/Finance')).default;
        const Habit = (await import('../models/Habit')).default;
        const Goal = (await import('../models/Goal')).default;
        const Relationship = (await import('../models/Relationship')).default;
        const Task = (await import('../models/Task')).default;

        await Promise.all([
            LifeEvent.deleteMany({ userId }),
            HealthLog.deleteMany({ userId }),
            Finance.deleteMany({ userId }),
            Habit.deleteMany({ userId }),
            Goal.deleteMany({ userId }),
            Relationship.deleteMany({ userId }),
            Task.deleteMany({ userId })
        ]);

        // Recalculate and reset scores
        await Kernel.updateLifeScores(userId as string);

        res.json({ message: 'All logs and data deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

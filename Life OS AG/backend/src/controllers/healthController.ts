import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import HealthLog from '../models/HealthLog';
import { Kernel } from '../services/Kernel';
import { EventType } from '../models/LifeEvent';

export const createHealthLog = async (req: AuthRequest, res: Response) => {
    try {
        const { sleepDuration, sleepQuality, waterIntake, stressLevel, mood, notes } = req.body;

        const log: any = await HealthLog.create({
            userId: req.user._id,
            sleepHours: sleepDuration,
            sleepQuality,
            waterIntake,
            stress: stressLevel,
            mood,
            notes
        });

        // Map health log to life event
        // We use an avg value of metrics for the overall impact
        const weightedValue = Math.round(((mood * 10) + (sleepDuration * 10) + (100 - (stressLevel * 10)) + (waterIntake * 20)) / 4);

        await Kernel.processEvent(req.user._id, {
            type: EventType.HEALTH,
            title: `Daily Health Sync`,
            impact: weightedValue > 50 ? 'positive' : 'neutral',
            value: weightedValue,
            metadata: { logId: log._id }
        });

        res.status(201).json(log);
    } catch (error: any) {
        console.error('Create Health Log Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getHealthLogs = async (req: AuthRequest, res: Response) => {
    try {
        const logs = await HealthLog.find({ userId: req.user._id }).sort({ timestamp: -1 });
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteHealthLog = async (req: AuthRequest, res: Response) => {
    try {
        const log = await HealthLog.findById(req.params.id);
        if (!log || log.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Log not found' });
        }

        await HealthLog.findByIdAndDelete(req.params.id);

        // Recalculate scores after deletion
        await Kernel.updateLifeScores(req.user._id as string);

        res.json({ message: 'Log deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

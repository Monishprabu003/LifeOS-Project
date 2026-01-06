import HealthLog from '../models/HealthLog.js';
import { Kernel } from '../services/Kernel.js';

export const createHealthLog = async (req, res) => {
    try {
        const { sleepDuration, sleepQuality, waterIntake, stressLevel, mood, notes } = req.body;

        const log = await HealthLog.create({
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
            type: 'health',
            title: `Daily Health Sync`,
            impact: weightedValue > 50 ? 'positive' : 'neutral',
            value: weightedValue,
            metadata: { logId: log._id }
        });

        res.status(201).json(log);
    } catch (error) {
        console.error('Create Health Log Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getHealthLogs = async (req, res) => {
    try {
        const logs = await HealthLog.find({ userId: req.user._id }).sort({ timestamp: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteHealthLog = async (req, res) => {
    try {
        const log = await HealthLog.findById(req.params.id);
        if (!log || log.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Log not found' });
        }

        await HealthLog.findByIdAndDelete(req.params.id);

        // Recalculate scores after deletion
        await Kernel.updateLifeScores(req.user._id);

        res.json({ message: 'Log deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

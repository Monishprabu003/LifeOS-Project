import { Kernel } from '../services/Kernel.js';
import LifeEvent from '../models/LifeEvent.js';
import User from '../models/User.js';
import HealthLog from '../models/HealthLog.js';
import Finance from '../models/Finance.js';
import Habit from '../models/Habit.js';
import Goal from '../models/Goal.js';
import Relationship from '../models/Relationship.js';
import Task from '../models/Task.js';

export const createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        const userId = req.user._id;

        const event = await Kernel.processEvent(userId, eventData);
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getEvents = async (req, res) => {
    try {
        const events = await LifeEvent.find({ userId: req.user._id }).sort({ timestamp: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLifeStatus = async (req, res) => {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const event = await LifeEvent.findById(req.params.id);
        if (!event || event.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check for associated source data in metadata and delete it
        if (event.metadata) {
            const metadata = event.metadata;

            // Handle cross-model map or object access
            const getMeta = (key) => metadata.get ? metadata.get(key) : metadata[key];

            // Handle Health Logs
            const logId = getMeta('logId');
            if (logId) {
                await HealthLog.findByIdAndDelete(logId);
            }

            // Handle Transactions
            const transactionId = getMeta('transactionId');
            if (transactionId) {
                await Finance.findByIdAndDelete(transactionId);
            }

            // Handle Goal Rollback (if it was a 'goal achieved' event)
            const goalId = getMeta('goalId');
            if (goalId) {
                await Goal.findByIdAndUpdate(goalId, {
                    status: 'active',
                    progress: 90
                });
            }

            // Handle Habit Rollback
            const habitId = getMeta('habitId');
            if (habitId) {
                const habit = await Habit.findById(habitId);
                if (habit && habit.history.length > 0) {
                    habit.history.pop();
                    habit.streak = Math.max(0, habit.streak - 1);
                    const lastComp = habit.history[habit.history.length - 1];
                    habit.lastCompleted = lastComp ? lastComp.date : null;
                    await habit.save();
                }
            }
        }

        await LifeEvent.findByIdAndDelete(req.params.id);

        // Recalculate scores (some events might affect scores)
        await Kernel.updateLifeScores(req.user._id);

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete Event Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteAllData = async (req, res) => {
    try {
        const userId = req.user._id;

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
        await Kernel.updateLifeScores(userId);

        res.json({ message: 'All logs and data deleted successfully' });
    } catch (error) {
        console.error('Purge Error:', error);
        res.status(500).json({ message: error.message });
    }
};

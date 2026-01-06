import Goal from '../models/Goal.js';
import { Kernel } from '../services/Kernel.js';

export const createGoal = async (req, res) => {
    try {
        const goal = await Goal.create({
            userId: req.user._id,
            ...req.body,
        });

        // Recalculate scores for instant dashboard reflection
        await Kernel.updateLifeScores(req.user._id);

        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user._id }).populate('tasks');
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGoalProgress = async (req, res) => {
    try {
        const { progress } = req.body;
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        goal.progress = progress;
        if (progress === 100) {
            goal.status = 'completed';
            await Kernel.processEvent(req.user._id, {
                type: 'productivity',
                title: `Achieved Goal: ${goal.title}`,
                impact: 'positive',
                value: 10,
                metadata: { goalId: goal._id }
            });
        } else {
            // Even partial progress updates the dashboard instantly
            await Kernel.updateLifeScores(req.user._id);
        }

        await goal.save();
        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        await Goal.findByIdAndDelete(req.params.id);

        // Recalculate scores
        await Kernel.updateLifeScores(req.user._id);

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

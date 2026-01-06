import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Habit from '../models/Habit';
import { Kernel } from '../services/Kernel';
import { EventType } from '../models/LifeEvent';

export const createHabit = async (req: AuthRequest, res: Response) => {
    try {
        const habit = await Habit.create({
            userId: req.user._id,
            ...req.body,
        });

        // Recalculate scores for instant dashboard reflection
        await Kernel.updateLifeScores(req.user._id as string);

        res.status(201).json(habit);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getHabits = async (req: AuthRequest, res: Response) => {
    try {
        const habits = await Habit.find({ userId: req.user._id });
        res.json(habits);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const completeHabit = async (req: AuthRequest, res: Response) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit || habit.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        habit.lastCompleted = new Date();
        habit.streak += 1;
        if (habit.streak > habit.bestStreak) habit.bestStreak = habit.streak;

        habit.history.push({ date: new Date(), completed: true });
        await habit.save();

        // Log a life event
        await Kernel.processEvent(req.user._id, {
            type: EventType.HABIT,
            title: `Completed habit: ${habit.name}`,
            impact: 'positive',
            value: 1,
            metadata: { habitId: habit._id }
        });

        res.json(habit);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteHabit = async (req: AuthRequest, res: Response) => {
    try {
        const habit = await Habit.findById(req.params.id);
        if (!habit || habit.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        await Habit.findByIdAndDelete(req.params.id);

        // Recalculate scores
        await Kernel.updateLifeScores(req.user._id as string);

        res.json({ message: 'Habit deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

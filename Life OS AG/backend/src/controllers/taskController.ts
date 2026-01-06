import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Task from '../models/Task';
import Goal from '../models/Goal';
import { Kernel } from '../services/Kernel';

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, goalId, priority, dueDate } = req.body;
        const task = await Task.create({
            userId: req.user._id,
            goalId,
            title,
            priority,
            dueDate
        });

        if (goalId) {
            await Goal.findByIdAndUpdate(goalId, { $push: { tasks: task._id } });
        }

        res.status(201).json(task);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleTask = async (req: AuthRequest, res: Response) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.status = task.status === 'done' ? 'todo' : 'done';
        await task.save();

        // If part of a goal, update goal progress
        if (task.goalId) {
            const goal: any = await Goal.findById(task.goalId).populate('tasks');
            if (goal) {
                const total = goal.tasks.length;
                const completed = goal.tasks.filter((t: any) => t.status === 'done').length;
                goal.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                await goal.save();

                // Trigger score update
                await Kernel.updateLifeScores(req.user._id as string);
            }
        }

        res.json(task);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const tasks = await Task.find({ userId: req.user._id });
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

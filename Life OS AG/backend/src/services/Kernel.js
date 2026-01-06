import User from '../models/User.js';
import LifeEvent, { EventType } from '../models/LifeEvent.js';
import HealthLog from '../models/HealthLog.js';
import Habit from '../models/Habit.js';
import Goal from '../models/Goal.js';
import Relationship from '../models/Relationship.js';
import Finance from '../models/Finance.js';

class LifeKernelEngine {
    /**
     * Orchestrates event ingestion and updates the global life state.
     */
    async processEvent(userId, eventData) {
        // 1. Log the event
        const event = await LifeEvent.create({
            userId,
            ...eventData,
        });

        // 2. Trigger score recalculation (Await to ensure consistency for re-fetches)
        await this.updateLifeScores(userId);

        return event;
    }

    /**
     * Recalculates all life scores for a user based on their actual data across all modules.
     */
    async updateLifeScores(userId) {
        const user = await User.findById(userId);
        if (!user) return;

        // 1. Health Score Calculation
        const recentLogs = await HealthLog.find({ userId }).sort({ timestamp: -1 }).limit(7);
        let healthScore = 0;
        if (recentLogs.length > 0) {
            const avgLog = recentLogs.reduce((acc, log) => {
                const dayScore = ((log.mood * 10) + (log.sleepHours * 10) + (100 - (log.stress * 10)) + (Math.min(log.waterIntake, 2.5) * 40)) / 4;
                return acc + dayScore;
            }, 0) / recentLogs.length;
            healthScore = Math.min(100, Math.round(avgLog));
        }

        // 2. Wealth Score Calculation
        const transactions = await Finance.find({ userId });
        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        let wealthScore = 0; // Starting at 0 for no data
        if (income > 0) {
            const savingsRate = (income - expense) / income;
            wealthScore = Math.max(0, Math.min(100, Math.round(savingsRate * 100)));
        } else if (expense > 0) {
            wealthScore = 10; // Low score if only expenses exist
        }

        // 3. Habit Score Calculation
        const habits = await Habit.find({ userId, isActive: true });
        let habitScore = 0;
        if (habits.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const completedToday = habits.filter(h => h.lastCompleted && new Date(h.lastCompleted) >= today).length;
            habitScore = Math.round((completedToday / habits.length) * 100);
        }

        // 4. Goal Score Calculation
        const goals = await Goal.find({ userId, status: { $ne: 'abandoned' } });
        let goalScore = 0;
        if (goals.length > 0) {
            const avgProgress = goals.reduce((s, g) => s + g.progress, 0) / goals.length;
            goalScore = Math.round(avgProgress);
        }

        // 5. Relationship Score Calculation
        const relationships = await Relationship.find({ userId });
        let relationshipScore = 0;
        if (relationships.length > 0) {
            relationshipScore = Math.min(100, relationships.length * 10); // Reward for quantity initially
            const avgHealth = relationships.reduce((s, r) => s + (r.healthScore || 0), 0) / relationships.length;
            relationshipScore = Math.round((relationshipScore + avgHealth) / 2);
        }

        // Update User Model
        user.healthScore = healthScore;
        user.wealthScore = wealthScore;
        user.habitScore = habitScore;
        user.goalScore = goalScore;
        user.relationshipScore = relationshipScore;

        // Composite Life Score
        // Priority: Health (35%) > Goals (20%) > Relationships (20%) > Habits (15%) > Wealth (10%)
        user.lifeScore = Math.round(
            (healthScore * 0.35) +
            (goalScore * 0.20) +
            (relationshipScore * 0.20) +
            (habitScore * 0.15) +
            (wealthScore * 0.10)
        );

        await user.save();
    }
}

export const Kernel = new LifeKernelEngine();

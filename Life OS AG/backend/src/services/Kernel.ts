import User from '../models/User';
import LifeEvent, { EventType } from '../models/LifeEvent';

class LifeKernelEngine {
    /**
     * Orchestrates event ingestion and updates the global life state.
     */
    async processEvent(userId: string, eventData: any) {
        // 1. Log the event
        const event = await LifeEvent.create({
            userId,
            ...eventData,
        });

        // 2. Trigger score recalculation (Async)
        this.updateLifeScores(userId);

        return event;
    }

    /**
     * Recalculates all life scores for a user based on their recent events.
     * Logic: (health > relationships > work > goals)
     */
    async updateLifeScores(userId: string) {
        const user = await User.findById(userId);
        if (!user) return;

        // Simple heuristic-based scoring for now (to be expanded)
        // In a real system, this would analyze the last 30 days of events.

        // Placeholder logic for v1:
        const events = await LifeEvent.find({ userId }).sort({ timestamp: -1 }).limit(100);

        let hScore = 70; // Base scores
        let wScore = 70;
        let hbScore = 70;
        let gScore = 70;
        let rScore = 70;

        events.forEach(event => {
            const weight = event.impact === 'positive' ? 1 : event.impact === 'negative' ? -1 : 0;

            switch (event.type) {
                case EventType.HEALTH: hScore += weight * 2; break;
                case EventType.FINANCIAL: wScore += weight * 2; break;
                case EventType.HABIT: hbScore += weight * 2; break;
                case EventType.PRODUCTIVITY: gScore += weight * 2; break;
                case EventType.SOCIAL: rScore += weight * 2; break;
            }
        });

        // Bound scores between 0 and 100
        user.healthScore = Math.min(100, Math.max(0, hScore));
        user.wealthScore = Math.min(100, Math.max(0, wScore));
        user.habitScore = Math.min(100, Math.max(0, hbScore));
        user.goalScore = Math.min(100, Math.max(0, gScore));
        user.relationshipScore = Math.min(100, Math.max(0, rScore));

        // Composite Life Score (Priority health > relationships > work)
        // Health (40%), Relationships (30%), Wealth/Goals (30%)
        user.lifeScore = Math.round(
            (user.healthScore * 0.4) +
            (user.relationshipScore * 0.3) +
            ((user.wealthScore + user.goalScore + user.habitScore) / 3 * 0.3)
        );

        await user.save();

        // TODO: Broadcast update via Socket.io
    }
}

export const Kernel = new LifeKernelEngine();

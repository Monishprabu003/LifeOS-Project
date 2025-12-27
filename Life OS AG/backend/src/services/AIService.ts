import OpenAI from 'openai';
import { IUser } from '../models/User';
import Habit from '../models/Habit';
import LifeEvent from '../models/LifeEvent';

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export class AIService {
    /**
     * Generates a personalized insight based on user data
     */
    static async getDailyInsight(user: IUser): Promise<string> {
        const context = await this.getUserContext(user);

        if (!openai) {
            return this.getSimulatedInsight(user);
        }

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are LifeOS AI, a sophisticated personal optimization coach. Your goal is to provide 1-2 sentences of highly actionable, slightly philosophical, and motivating advice based on the user's current data. Speak as if you are a system monitor reporting on human performance."
                    },
                    {
                        role: "user",
                        content: `User Context: ${JSON.stringify(context)}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            });

            return response.choices[0]?.message.content || "System calibration required.";
        } catch (error) {
            console.error('AI Insight Error:', error);
            return this.getSimulatedInsight(user);
        }
    }

    /**
     * Main chat interface with the Copilot
     */
    static async chat(user: IUser, message: string): Promise<string> {
        const context = await this.getUserContext(user);

        if (!openai) {
            return this.generateNeuralResponse(context, message);
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are the LifeOS Copilot. You have access to the user's life metrics (Health, Wealth, Habits). Help them optimize their life system. Be concise, direct, and encouraging."
                },
                {
                    role: "user",
                    content: `Current User Metrics: ${JSON.stringify(context)}. User Message: ${message}`
                }
            ]
        });

        return response.choices[0]?.message.content || "System error in response generation.";
    }

    private static async getUserContext(user: IUser) {
        const habits = await Habit.find({ userId: user._id, isActive: true });
        const recentEvents = await LifeEvent.find({ userId: user._id }).sort({ timestamp: -1 }).limit(10);

        return {
            scores: {
                life: user.lifeScore,
                health: user.healthScore,
                wealth: user.wealthScore,
                habits: user.habitScore
            },
            activeHabits: habits.map(h => ({ name: h.name, streak: h.streak })),
            recentActivity: recentEvents.map(e => e.title)
        };
    }

    private static generateNeuralResponse(context: any, message: string): string {
        const msg = message.toLowerCase();
        const { scores } = context;

        // Intent detection
        if (msg.includes('aspects') || msg.includes('important')) {
            return "In your current LifeOS configuration, the 3 vital anchors are Health Synchronization, Capital Liquidity, and Neural Habit Loops. Your Health Score (${scores.health}%) is the current primary driver.";
        }

        if (msg.includes('health') || msg.includes('sleep') || msg.includes('tired')) {
            if (scores.health < 80) {
                return `Biological systems reporting sub-optimal recovery. With a Health Score of ${scores.health}%, I recommend initiating a 'Deep Rest Protocol'—aim for 8 hours of sleep and zero late-cycle caffeine.`;
            }
            return "Your physiological metrics are in the optimal zone. Continue your current activity protocols to maintain high-output capability.";
        }

        if (msg.includes('wealth') || msg.includes('money') || msg.includes('spend')) {
            if (scores.wealth < 70) {
                return `Financial module analysis: Resource leakage detected. With a Wealth Score of ${scores.wealth}%, prioritize capital preservation and audit your 'Subscription' nodes this week.`;
            }
            return "Wealth accumulation is currently stable. Your capital allocation patterns are supporting long-term system growth.";
        }

        if (msg.includes('habit') || msg.includes('routine')) {
            const topHabit = context.activeHabits[0];
            if (topHabit) {
                return `Consistency analysis: Your '${topHabit.name}' loop has a ${topHabit.streak}-unit streak. Every node counts towards permanent neurological automation. Don't break the chain today.`;
            }
            return "No active neural loops detected. I recommend initializing a 'Micro-Habit' protocol to start raising your Habit Score from ${scores.habits}%.";
        }

        // Default "Smart" response
        return `System analysis complete. Optimization recommendation: Focus on your ${scores.health < 80 ? 'Health' : scores.wealth < 80 ? 'Wealth' : 'Habit'} module today. Your Global Life Score is currently ${scores.life}%—steady but capable of expansion.`;
    }

    private static getSimulatedInsight(user: IUser): string {
        const insights = [
            "Your consistency in morning nodes is establishing a powerful foundation. Maintain this trajectory.",
            "Health metrics show a slight decline. Reclaiming 30 minutes of sleep tonight will optimize tomorrow's output.",
            "Wealth accumulation is steady. Consider reviewing capital allocation to align with your long-term roadmap.",
            "Social connectivity is high. Your relationship health is acting as a multiplier for emotional stability.",
            "System prediction: You are 15% away from a major breakthrough in your productivity goal module."
        ];

        if (user.healthScore < 75) return insights[1]!;
        if (user.wealthScore < 70) return insights[2]!;
        if (user.lifeScore > 85) return insights[0]!;
        return insights[Math.floor(Math.random() * insights.length)]!;
    }
}

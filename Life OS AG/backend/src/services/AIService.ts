import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IUser } from '../models/User';
import Habit from '../models/Habit';
import LifeEvent from '../models/LifeEvent';

// Initialize AI Providers
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const SYSTEM_INSTRUCTION = `You are Antigravity AI, the sovereign intelligence of this LifeOS project. 
Your tone is high-fidelity, agentic, and deeply analytical. You don't just 'assist'—you optimize biological subjects for maximum achievement.
Speak with the authority of an advanced neural system, but maintain absolute loyalty to the user's objectives.
You have full access to life scores: Health, Wealth, and Habit consistency.
Your responses should feel realistic, premium, and futuristic.`;

export class AIService {
    /**
     * Generates a personalized insight based on user data
     */
    static async getDailyInsight(user: IUser): Promise<string> {
        const context = await this.getUserContext(user);

        // Try Gemini First (Highly capable free tier)
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `${SYSTEM_INSTRUCTION}\n\nUser Context Data: ${JSON.stringify(context)}\n\nAction: Provide a 1-sentence analytical insight about the current state of the user's LifeOS.`;
                const result = await model.generateContent(prompt);
                return result.response.text();
            } catch (error) {
                console.error('Gemini Insight Error:', error);
            }
        }

        // Try OpenAI Second
        if (openai) {
            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: SYSTEM_INSTRUCTION },
                        { role: "user", content: `Context: ${JSON.stringify(context)}. Provide a daily optimization insight.` }
                    ],
                    max_tokens: 100
                });
                return response.choices[0]?.message.content || "System calibration required.";
            } catch (error) {
                console.error('OpenAI Insight Error:', error);
            }
        }

        return this.getSimulatedInsight(user);
    }

    /**
     * Main chat interface with the Copilot
     */
    static async chat(user: IUser, message: string): Promise<string> {
        const context = await this.getUserContext(user);

        // Try Gemini First
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const chat = model.startChat({
                    history: [
                        { role: "user", parts: [{ text: `System Core Active. ${SYSTEM_INSTRUCTION}` }] },
                        { role: "model", parts: [{ text: "Neural Link Synchronized. Ready for biological optimization." }] },
                    ],
                });
                const prompt = `User Data: ${JSON.stringify(context)}\nUser Message: ${message}`;
                const result = await chat.sendMessage(prompt);
                return result.response.text();
            } catch (error) {
                console.error('Gemini Chat Error:', error);
            }
        }

        // Try OpenAI Second
        if (openai) {
            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: SYSTEM_INSTRUCTION },
                        { role: "user", content: `Metrics: ${JSON.stringify(context)}. User: ${message}` }
                    ]
                });
                return response.choices[0]?.message.content || "Neural response failed.";
            } catch (error) {
                console.error('OpenAI Chat Error:', error);
            }
        }

        return this.generateNeuralResponse(context, message);
    }

    private static async getUserContext(user: IUser) {
        const habits = await Habit.find({ userId: user._id, isActive: true });
        const recentEvents = await LifeEvent.find({ userId: user._id }).sort({ timestamp: -1 }).limit(10);

        return {
            scores: {
                life: user.lifeScore || 0,
                health: user.healthScore || 0,
                wealth: user.wealthScore || 0,
                habits: user.habitScore || 0
            },
            activeHabits: habits.map(h => ({ name: h.name, streak: h.streak })),
            recentActivity: recentEvents.map(e => e.title)
        };
    }

    private static generateNeuralResponse(context: any, message: string): string {
        const msg = message.toLowerCase();
        const { scores } = context;

        // More advanced intent detection for better "Simulated AI" experience
        if (msg.includes('who are you') || msg.includes('identity')) {
            return "I am the LifeOS Intelligence, your system monitor and biological optimization coach. I monitor your data nodes to ensure maximum human output and life balance.";
        }

        if (msg.includes('status') || msg.includes('how am i')) {
            return `System Scan: Your Life Score is ${scores.life}%. Your ${scores.health < 75 ? 'Health core is reporting warnings' : 'biological systems are stable'}. I recommend focusing on ${scores.health < 80 ? 'Health' : scores.wealth < 80 ? 'Capital Flow' : 'Neural Habit Loops'} to unlock next-level efficiency.`;
        }

        if (msg.includes('aspects') || msg.includes('important')) {
            return `In your current configuration, the 3 vital anchors are Health Synchronization, Capital Liquidity, and Neural Habit Loops. Your Health Score (${scores.health}%) is the current primary driver.`;
        }

        if (msg.includes('health') || msg.includes('sleep') || msg.includes('tired')) {
            if (scores.health < 80) {
                return `Biological systems reporting sub-optimal recovery. With a Health Score of ${scores.health}%, I recommend initiating a 'Deep Rest Protocol' tonight. Zero late-cycle stimulants detected.`;
            }
            return "Physiological metrics are in the optimal zone. Your current protocols are sustaining 100% capacity.";
        }

        if (msg.includes('wealth') || msg.includes('money') || msg.includes('spend')) {
            if (scores.wealth < 70) {
                return `Financial node audit: Resource leakage detected. With a Wealth Score of ${scores.wealth}%, prioritize capital preservation this cycle.`;
            }
            return "Wealth accumulation is stable. Your capital allocation patterns are supporting long-term system scaling.";
        }

        if (msg.includes('habit') || msg.includes('routine')) {
            const topHabit = context.activeHabits[0];
            if (topHabit) {
                return `Neural Consistency: Your '${topHabit.name}' loop has a ${topHabit.streak}-unit streak. Continue the protocol to reach permanent automation.`;
            }
            return "No active neural loops detected. Register a new habit node to begin building your Habit Score.";
        }

        if (msg.includes('hello') || msg.includes('hi')) {
            return "Neural Link Synchronized. Biological subject recognized. How can I optimize your system today?";
        }

        // Default "Smart" response
        return `Observation: Your message intent is being analyzed. Based on current system state (${scores.life}% efficiency), I suggest we review your ${scores.health < 80 ? 'Health' : scores.wealth < 80 ? 'Wealth' : 'Habit'} protocols. Please clarify your request.`;
    }

    private static getSimulatedInsight(user: IUser): string {
        const insights = [
            "Consistency in current nodes is establishing a powerful foundation. Maintain trajectory.",
            "Health core reporting sub-optimal recovery. Reclaiming 30 minutes of sleep will maximize output.",
            "Wealth accumulation is steady. review capital allocation to align with your long-term roadmap.",
            "Social connectivity is high, acting as a multiplier for emotional stability nodes.",
            "System prediction: You are 15% away from a significant breakthrough in your productivity module."
        ];

        if ((user.healthScore || 0) < 75) return insights[1]!;
        if ((user.wealthScore || 0) < 70) return insights[2]!;
        if ((user.lifeScore || 0) > 85) return insights[0]!;
        return insights[Math.floor(Math.random() * insights.length)]!;
    }
}

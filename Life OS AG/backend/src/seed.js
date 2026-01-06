import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Habit from './models/Habit.js';
import LifeEvent from './models/LifeEvent.js';
import HealthLog from './models/HealthLog.js';
import Finance from './models/Finance.js';
import Goal from './models/Goal.js';
import Relationship from './models/Relationship.js';
import Task from './models/Task.js';

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lifeos');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Habit.deleteMany({});
        await LifeEvent.deleteMany({});
        await HealthLog.deleteMany({});
        await Finance.deleteMany({});
        await Goal.deleteMany({});
        await Relationship.deleteMany({});
        await Task.deleteMany({});

        // 1. Create a demo user with zero scores
        const user = await User.create({
            name: 'Human 001',
            email: 'demo@lifeos.com',
            password: 'password123',
            lifeScore: 0,
            healthScore: 0,
            wealthScore: 0,
            habitScore: 0,
            goalScore: 0,
            relationshipScore: 0,
        });

        console.log('Clean demo user created:', user.email);
        console.log('Comprehensive seeding complete (Initial State)!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seed();

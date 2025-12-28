import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    CheckCircle2,
    Flame,
    Target,
    TrendingUp,
    ClipboardList,
    Layout
} from 'lucide-react';
import { habitsAPI } from '../api';

interface Habit {
    _id: string;
    name: string;
    frequency: string;
    description: string;
    streak: number;
    completedToday?: boolean;
}

export function HabitsModule({ onUpdate }: { onUpdate?: () => void }) {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [description, setDescription] = useState('');

    const fetchHabits = async () => {
        try {
            const res = await habitsAPI.getHabits();
            setHabits(res.data);
        } catch (err) {
            console.error('Failed to fetch habits', err);
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    const handleCreateHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await habitsAPI.createHabit({ name, frequency, description });
            setShowForm(false);
            setName('');
            setFrequency('daily');
            setDescription('');
            fetchHabits();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Failed to initialize habit.');
        }
    };

    const completeHabit = async (id: string) => {
        try {
            await habitsAPI.completeHabit(id);
            fetchHabits();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Completion failed', err);
        }
    };

    const completedCount = habits.filter(h => h.completedToday).length;
    const totalCount = habits.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const longestStreak = Math.max(...habits.map(h => h.streak || 0), 0);

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-[#f59e0b] flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none">
                        <ClipboardList size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Habits & Tasks</h1>
                        <p className="text-slate-500 font-medium mt-1">Build consistency and track your streaks</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 transition-all shadow-lg shadow-orange-100 dark:shadow-none active:scale-95"
                >
                    <Plus size={20} />
                    <span>New Habit</span>
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Today's Progress */}
                <div className="bg-[#fffbeb] dark:bg-slate-900 rounded-[2.5rem] p-8 border border-orange-50 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-bold text-[#0f172a] dark:text-white mb-6">Today's Progress</h3>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-orange-50 dark:text-slate-800"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="#f59e0b"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={364.4}
                                strokeDashoffset={364.4 - (364.4 * progressPercent) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <span className="absolute text-4xl font-display font-bold text-[#0f172a] dark:text-white">{progressPercent}</span>
                    </div>
                    <p className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-wider">{completedCount}/{totalCount} habits completed</p>
                </div>

                {/* Active Habits */}
                <div className="bg-[#fffbeb] dark:bg-slate-900 rounded-[2.5rem] p-8 border border-orange-50 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Active Habits</p>
                        <Layout size={20} className="text-[#f59e0b]" />
                    </div>
                    <h4 className="text-5xl font-display font-bold text-[#0f172a] dark:text-white mt-4">{totalCount}</h4>
                </div>

                {/* Completed Today */}
                <div className="bg-[#fffbeb] dark:bg-slate-900 rounded-[2.5rem] p-8 border border-orange-50 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Completed Today</p>
                        <Target size={20} className="text-[#f59e0b]" />
                    </div>
                    <h4 className="text-5xl font-display font-bold text-[#0f172a] dark:text-white mt-4">{completedCount}</h4>
                </div>

                {/* Longest Streak */}
                <div className="bg-[#fffbeb] dark:bg-slate-900 rounded-[2.5rem] p-8 border border-orange-50 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Longest Streak</p>
                        <Flame size={20} className="text-[#f59e0b]" />
                    </div>
                    <div className="mt-4">
                        <h4 className="text-3xl font-display font-bold text-[#0f172a] dark:text-white tracking-tight">{longestStreak} days</h4>
                    </div>
                </div>

                {/* Weekly Score */}
                <div className="bg-[#fffbeb] dark:bg-slate-900 rounded-[2.5rem] p-8 border border-orange-50 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Weekly Score</p>
                        <TrendingUp size={20} className="text-[#f59e0b]" />
                    </div>
                    <div className="mt-4">
                        <h4 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white">91%</h4>
                        <p className="text-[10px] font-bold text-[#10b981] mt-2">+5% vs last week</p>
                    </div>
                </div>
            </div>

            {/* Weekly Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Weekly Overview</h3>
                <div className="grid grid-cols-7 gap-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <div key={day} className="flex flex-col items-center space-y-4">
                            <div
                                className={`w-full h-40 rounded-3xl flex items-center justify-center transition-all ${idx === 2 || idx === 5
                                        ? 'bg-[#f59e0b] text-white shadow-lg shadow-orange-100'
                                        : 'bg-[#fffbeb] text-[#f59e0b] border border-orange-50'
                                    }`}
                            >
                                <span className="text-lg font-bold">
                                    {idx === 2 ? '6/6' : idx === 5 ? '6/6' : idx === 1 ? '4/6' : '5/6'}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-slate-400 capitalize">{day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Habit Form Modal (simplified version linked to the New Habit button) */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative"
                    >
                        <h2 className="text-2xl font-bold mb-8">Initialize New Habit</h2>
                        <form onSubmit={handleCreateHabit} className="space-y-6">
                            <input
                                placeholder="Habit Name (e.g. Morning Meditation)"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#f59e0b]/20 outline-none"
                                required
                            />
                            <select
                                value={frequency}
                                onChange={e => setFrequency(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#f59e0b]/20 outline-none"
                            >
                                <option value="daily">Daily Loop</option>
                                <option value="weekly">Weekly Pulse</option>
                            </select>
                            <textarea
                                placeholder="Description (Optional)"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#f59e0b]/20 outline-none h-28"
                            />
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 bg-[#f59e0b] hover:bg-[#d97706] text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 dark:shadow-none transition-all">
                                    Start Ritual
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Active Rituals List */}
            <div className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-2xl font-display font-bold text-[#0f172a] dark:text-white">Active Rituals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map(habit => (
                        <div key={habit._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                                    <ClipboardList className="text-[#f59e0b]" size={20} />
                                </div>
                                <div className="flex items-center space-x-1 bg-[#fffbeb] dark:bg-orange-500/10 px-3 py-1 rounded-full">
                                    <Flame size={14} className="text-[#f59e0b]" />
                                    <span className="text-xs font-bold text-[#f59e0b]">{habit.streak} day streak</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <h4 className="font-bold text-lg text-[#0f172a] dark:text-white">{habit.name}</h4>
                                <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">{habit.frequency}</p>
                            </div>
                            <button
                                onClick={() => completeHabit(habit._id)}
                                disabled={habit.completedToday}
                                className={`w-full mt-8 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center space-x-2 ${habit.completedToday
                                        ? 'bg-[#ecfdf5] text-[#10b981] cursor-default'
                                        : 'bg-[#f59e0b] hover:bg-[#d97706] text-white shadow-lg shadow-orange-100 active:scale-95'
                                    }`}
                            >
                                <CheckCircle2 size={18} />
                                <span>{habit.completedToday ? 'Ritual Sync Completed' : 'Mark as Completed'}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    CheckCircle2,
    Flame,
    Target,
    TrendingUp,
    ClipboardList,
    Layout,
    Trash2
} from 'lucide-react';
import api, { habitsAPI } from '../api';

interface Habit {
    _id: string;
    name: string;
    frequency: string;
    description: string;
    streak: number;
    completedToday?: boolean;
}

export function HabitsModule({ onUpdate, user }: { onUpdate?: () => void, user?: any }) {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [description, setDescription] = useState('');

    const fetchHabits = async () => {
        try {
            const res = await habitsAPI.getHabits();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const habitsWithCompletion = res.data.map((h: any) => ({
                ...h,
                completedToday: h.lastCompleted && new Date(h.lastCompleted) >= today
            }));

            setHabits(habitsWithCompletion);
        } catch (err) {
            console.error('Failed to fetch habits', err);
        }
    };

    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const fetchRecentActivity = async () => {
        try {
            const res = await api.get('/kernel/events');
            // Filter only habit events
            const habitEvents = res.data.filter((e: any) => e.type === 'habit').slice(0, 10);
            setRecentActivity(habitEvents);
        } catch (err) {
            console.error('Failed to fetch habit activity', err);
        }
    };

    useEffect(() => {
        fetchHabits();
        fetchRecentActivity();
    }, [user]);

    const handleCreateHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await habitsAPI.createHabit({ name, frequency, description });
            setShowForm(false);
            setName('');
            setFrequency('daily');
            setDescription('');
            fetchHabits();
            fetchRecentActivity();
            if (onUpdate) onUpdate();
        } catch {
            alert('Failed to initialize habit.');
        }
    };

    const handleDeleteHabit = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this habit?')) return;

        try {
            await habitsAPI.deleteHabit(id);
            await fetchHabits();
            await fetchRecentActivity();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete habit', err);
        }
    };

    const handleDeleteActivity = async (id: string) => {
        if (!confirm('Delete this completion log?')) return;
        try {
            await api.delete(`/kernel/events/${id}`);
            fetchRecentActivity();
            fetchHabits();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete activity', err);
        }
    };

    const completeHabit = async (id: string) => {
        try {
            await habitsAPI.completeHabit(id);
            fetchHabits();
            fetchRecentActivity();
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
                        <h4 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white">
                            {progressPercent}%
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">Active session accuracy</p>
                    </div>
                </div>
            </div>

            {/* Weekly Overview */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Weekly Overview</h3>
                    <span className="text-xs font-bold text-slate-400">Past 7 days performance</span>
                </div>
                {habits.length > 0 ? (
                    <div className="grid grid-cols-7 gap-4">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <div key={day} className="flex flex-col items-center space-y-4">
                                <div className="w-full h-40 rounded-3xl flex items-center justify-center bg-[#fffbeb] text-[#f59e0b] border border-orange-50 opacity-40">
                                    <span className="text-xs font-bold uppercase tracking-widest rotate-90 whitespace-nowrap">No Data</span>
                                </div>
                                <span className="text-sm font-bold text-slate-400 capitalize">{day}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <p className="text-slate-500 font-medium">Initialize your first habit to begin performance mapping.</p>
                    </div>
                )}
            </div>

            {/* Habit Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative"
                    >
                        <h2 className="text-2xl font-bold mb-8 text-[#0f172a] dark:text-white">Initialize New Habit</h2>
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

            {/* Your Habits Section */}
            <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-8">Your Habits</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {habits.map(habit => {
                        const totalGoal = 30; // Mocked goal
                        const progress = (habit.streak / totalGoal) * 100;

                        return (
                            <div
                                key={habit._id}
                                className={`p-6 rounded-[1.5rem] border transition-all cursor-pointer relative group ${habit.completedToday
                                    ? 'bg-[#fffbeb] border-[#f59e0b] shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700'
                                    }`}
                                onClick={() => !habit.completedToday && completeHabit(habit._id)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">
                                            {habit.name.toLowerCase().includes('meditation') ? '🧘' :
                                                habit.name.toLowerCase().includes('read') ? '📚' :
                                                    habit.name.toLowerCase().includes('water') ? '💧' :
                                                        habit.name.toLowerCase().includes('journal') ? '📝' :
                                                            habit.name.toLowerCase().includes('expense') ? '💰' : '✨'}
                                        </span>
                                        <div>
                                            <h4 className="font-bold text-[#0f172a] dark:text-white">{habit.name}</h4>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <div className="flex items-center space-x-1 text-slate-400">
                                                    <Flame size={14} className="text-[#f59e0b]" />
                                                    <span className="text-xs font-bold">{habit.streak} day streak</span>
                                                </div>
                                                <div className={`w-2 h-2 rounded-full ${habit.completedToday ? 'bg-[#10b981]' : 'bg-slate-300'
                                                    }`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={(e) => handleDeleteHabit(habit._id, e)}
                                            className="p-2 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                                            title="Delete Habit"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${habit.completedToday
                                            ? 'bg-[#f59e0b] border-[#f59e0b] text-white shadow-sm'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-orange-200'
                                            }`}>
                                            {habit.completedToday && <CheckCircle2 size={16} strokeWidth={3} />}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Progress to goal</span>
                                        <span className="text-[10px] font-bold text-slate-500 pr-1">{habit.streak}/{totalGoal} days</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(progress, 100)}%` }}
                                            className="h-full bg-[#10b981] rounded-full shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Recent Habit Logs</h3>
                {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity._id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-slate-100 transition-colors">
                                <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#f59e0b] shadow-sm">
                                        <Flame size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#0f172a] dark:text-white">
                                            {activity.title}
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                            {new Date(activity.createdAt).toLocaleString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteActivity(activity._id)}
                                    className="p-2.5 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                                    title="Delete Activity Log"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center opacity-40">
                        <Flame size={40} className="mx-auto mb-4 text-slate-200" />
                        <p className="text-slate-500 font-medium text-sm">No activity logs found. Complete a habit to see it here!</p>
                    </div>
                )}
            </div>
        </div >
    );
}



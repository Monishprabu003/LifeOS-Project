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


export function HabitsModule({ onUpdate, user, isDarkMode }) {
    const [habits, setHabits] = useState([]);
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

            const habitsWithCompletion = res.data.map((h) => ({
                ...h,
                completedToday: h.lastCompleted && new Date(h.lastCompleted) >= today
            }));

            setHabits(habitsWithCompletion);
        } catch (err) {
            console.error('Failed to fetch habits', err);
        }
    };

    const [recentActivity, setRecentActivity] = useState([]);
    const fetchRecentActivity = async () => {
        try {
            const res = await api.get('/kernel/events');
            // Filter only habit events
            const habitEvents = res.data.filter((e) => e.type === 'habit').slice(0, 10);
            setRecentActivity(habitEvents);
        } catch (err) {
            console.error('Failed to fetch habit activity', err);
        }
    };

    useEffect(() => {
        fetchHabits();
        fetchRecentActivity();
    }, [user]);

    const handleCreateHabit = async (e) => {
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

    const handleDeleteHabit = async (id, e) => {
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

    const handleDeleteActivity = async (id) => {
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

    const completeHabit = async (id) => {
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
                <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/20">
                        <CheckCircle2 size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Habit Tracking</h1>
                        <p className="text-slate-500 font-medium mt-1">Build consistency and track your streaks</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center space-x-3 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                >
                    <Plus size={20} />
                    <span>Manage Rituals</span>
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 glass-card p-10 flex flex-col items-center justify-center border-none">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 w-full">Ritual Performance</h3>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="5"
                                fill="transparent"
                                className="text-slate-100 dark:text-white/10"
                            />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="#f59e0b"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray="283"
                                initial={{ strokeDashoffset: 283 }}
                                animate={{ strokeDashoffset: 283 - (283 * progressPercent) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-display font-bold text-[#0f172a] dark:text-white leading-none">88</span>
                        </div>
                    </div>
                    <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Average</p>
                </div>

                <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Longest Streak', value: `${longestStreak}d`, icon: Flame, trend: '+2d vs last week' },
                        { label: 'Completed Today', value: completedCount, icon: Target, trend: '+1 vs yesterday' },
                        { label: 'Active Habits', value: totalCount, icon: Layout, trend: 'Unchanged' },
                        { label: 'Consistency', value: `${progressPercent}%`, icon: TrendingUp, trend: '+5% vs last week' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card p-8 border-none flex flex-col justify-between dark:bg-amber-950/20">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-tight w-2/3">{stat.label}</span>
                                <stat.icon size={20} className="text-white/40" />
                            </div>
                            <div className="mt-8">
                                <p className="text-2xl font-display font-bold text-[#0f172a] dark:text-white leading-none">{stat.value}</p>
                                <p className="text-[10px] font-bold text-amber-400 mt-2 uppercase tracking-widest">{stat.trend}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Overview */}
            <div className="glass-card p-10">
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
            <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Daily Rituals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map(habit => (
                        <div key={habit._id} className={`glass-card p-6 border-none flex flex-col justify-between transition-all group ${habit.completedToday ? 'dark:bg-amber-950/20' : ''}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${habit.completedToday ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                                        <CheckCircle2 size={22} />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-[#0f172a] dark:text-white">{habit.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{habit.streak} day streak 🔥</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !habit.completedToday && completeHabit(habit._id)}
                                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${habit.completedToday ? 'bg-amber-500 border-amber-500' : 'border-slate-300 dark:border-white/10 hover:border-amber-500'}`}
                                >
                                    {habit.completedToday && <Plus size={16} className="text-white rotate-45" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{habit.frequency} ritual</span>
                                <button
                                    onClick={(e) => handleDeleteHabit(habit._id, e)}
                                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="glass-card p-10 border-none">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Recent Habit Logs</h3>
                {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div
                                key={activity._id}
                                className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-white/[0.03] rounded-2xl group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                        <Flame size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#0f172a] dark:text-white">{activity.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                            {new Date(activity.createdAt).toLocaleString(undefined, { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteActivity(activity._id)}
                                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center opacity-40">
                        <Flame size={40} className="mx-auto mb-4 text-slate-200" />
                        <p className="text-slate-400 font-medium text-sm">No activity logs found. Complete a habit to see it here!</p>
                    </div>
                )}
            </div>
        </div>
    );
}



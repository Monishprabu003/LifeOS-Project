import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    TrendingUp,
    Moon,
    Droplets,
    Smile,
    CheckCircle2,
    Trash2,
    Activity
} from 'lucide-react';
import { kernelAPI } from '../api';

interface CircularProgressProps {
    value: number;
    color: string;
    size?: number;
    strokeWidth?: number;
    showLabel?: boolean;
}

const CircularProgress = ({ value, color, size = 120, strokeWidth = 10, showLabel = true }: CircularProgressProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-bold text-main">{value}</span>
                </div>
            )}
        </div>
    );
};

export function DashboardModule({ user, habits, goals, setActiveTab, onUpdate }: any) {
    const [events, setEvents] = useState<any[]>([]);

    const fetchEvents = async () => {
        try {
            const res = await kernelAPI.getEvents();
            setEvents(res.data);
        } catch (err) {
            console.error('Failed to fetch events', err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user]);

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Delete this event log?')) return;
        try {
            await kernelAPI.deleteEvent(id);
            fetchEvents();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete event', err);
        }
    };

    const handleDeleteAllLogs = async () => {
        const confirm1 = confirm('⚠️ CRITICAL ACTION: This will permanently delete ALL logs, module data, and habits across the entire system. Are you absolutely sure?');
        if (!confirm1) return;

        const confirm2 = confirm('FINAL CONFIRMATION: This action is irreversible. All your data will be lost. Proceed?');
        if (!confirm2) return;

        try {
            await kernelAPI.deleteAllLogs();
            fetchEvents();
            if (onUpdate) onUpdate();
            alert('System reset complete. All data has been purged.');
        } catch (err) {
            console.error('Failed to delete all logs', err);
            alert('Failed to complete system purge.');
        }
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Calculate dynamic stats from real data
    const activeHabitsCount = habits?.length || 0;
    const completedHabitsCount = habits?.filter((h: any) => h.completedToday).length || 0;
    const activeGoalsCount = goals?.length || 0;

    // Empty tasks state for now or fetch from real source if available
    const tasks: any[] = [];

    return (
        <div className="space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white">Life Dashboard</h2>
                    <p className="text-slate-500 mt-2 font-medium">Your unified life performance overview</p>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 font-semibold text-sm">
                    <span>{today}</span>
                </div>
            </div>

            {/* Top Row: Unified Score & Weekly Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Unified Life Score</h3>
                    <CircularProgress value={user?.lifeScore || 0} color="#10b981" size={180} strokeWidth={14} />
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium">Your overall life performance</p>
                        <div className="flex items-center justify-center space-x-1 mt-2 text-slate-400 font-bold text-sm">
                            <TrendingUp size={16} />
                            <span>Awaiting more data</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Weekly Performance</h3>
                    </div>
                    <div className="h-[240px] w-full flex items-center justify-center">
                        <div className="text-center opacity-40">
                            <TrendingUp size={48} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-500 font-medium">Perform weekly actions to view trends</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Row: Module Scores */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Module Scores</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { name: 'Health', score: user?.healthScore || 0, color: '#10b981', bg: 'bg-[#ecfdf5]', tab: 'health' },
                        { name: 'Wealth', score: user?.wealthScore || 0, color: '#3b82f6', bg: 'bg-[#eff6ff]', tab: 'wealth' },
                        { name: 'Relationships', score: user?.relationshipScore || 0, color: '#f43f5e', bg: 'bg-[#fff1f2]', tab: 'relationships' },
                        { name: 'Habits', score: user?.habitScore || 0, color: '#f59e0b', bg: 'bg-[#fffbeb]', tab: 'habits' },
                        { name: 'Purpose', score: user?.goalScore || 0, color: '#8b5cf6', bg: 'bg-[#f5f3ff]', tab: 'goals' },
                    ].map((module) => (
                        <div
                            key={module.name}
                            onClick={() => setActiveTab && setActiveTab(module.tab)}
                            className={`${module.bg} rounded-[2rem] p-6 flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform cursor-pointer`}
                        >
                            <CircularProgress value={module.score} color={module.color} size={80} strokeWidth={8} />
                            <span className="mt-4 font-bold text-slate-700 text-sm">{module.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Row: Detailed Metrics & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Metric Cards */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div
                        onClick={() => setActiveTab && setActiveTab('health')}
                        className="bg-[#ecfdf5] rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sleep Quality</p>
                                <h4 className="text-2xl font-display font-bold mt-1 text-[#0f172a]">-- hrs</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Log today's sleep</p>
                            </div>
                            <Moon size={20} className="text-[#10b981]" />
                        </div>
                    </div>
                    <div
                        onClick={() => setActiveTab && setActiveTab('health')}
                        className="bg-[#eff6ff] rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Water Intake</p>
                                <h4 className="text-2xl font-display font-bold mt-1 text-[#0f172a]">0.0 L</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Stay hydrated</p>
                            </div>
                            <p className="hidden">{completedHabitsCount}/{activeHabitsCount}</p>
                            <Droplets size={20} className="text-[#3b82f6]" />
                        </div>
                    </div>
                    <div
                        onClick={() => setActiveTab && setActiveTab('health')}
                        className="bg-[#fff1f2] rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mood Score</p>
                                <h4 className="text-2xl font-display font-bold mt-1 text-[#0f172a]">--/10</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Track your mood</p>
                            </div>
                            <Smile size={20} className="text-[#f43f5e]" />
                        </div>
                    </div>
                    <div
                        onClick={() => setActiveTab && setActiveTab('goals')}
                        className="bg-[#fffbeb] rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Goals</p>
                                <h4 className="text-2xl font-display font-bold mt-1 text-[#0f172a]">{activeGoalsCount} goals</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Steady mission progress</p>
                            </div>
                            <Zap size={20} className="text-[#f59e0b]" />
                        </div>
                    </div>
                </div>

                {/* Today's Tasks */}
                <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Today's Tasks</h3>
                        <span className="text-xs font-bold text-slate-400">{tasks.length} pending</span>
                    </div>
                    {tasks.length > 0 ? (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-2 h-2 rounded-full ${task.color}`} />
                                        <span className={`text-sm font-semibold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-[#10b981] border-[#10b981]' : 'border-slate-200 dark:border-slate-700'}`}>
                                        {task.completed && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <CheckCircle2 size={40} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-400 font-medium text-sm">No tasks for today. Start by adding a habit or goal!</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Recent Activity</h3>
                            <button
                                onClick={handleDeleteAllLogs}
                                className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-full border border-red-100 transition-all uppercase tracking-widest"
                            >
                                Delete All Logs
                            </button>
                        </div>
                        <span className="text-xs font-bold text-slate-400">{events.length} logs</span>
                    </div>
                    {events.length > 0 ? (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                            {events.map((event) => (
                                <div key={event._id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm transition-colors">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#0f172a] dark:text-white">{event.title}</h4>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(event.timestamp).toLocaleString()}</p>
                                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${event.impact === 'positive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {event.impact}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteEvent(event._id)}
                                        className="p-2 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                                        title="Delete Activity"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center opacity-40">
                            <Activity size={40} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-500 font-medium text-sm">No recent activity logs.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

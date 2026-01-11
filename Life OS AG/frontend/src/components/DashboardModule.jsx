import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    CheckCircle2,
    Trash2,
    Activity,
    Heart,
    Wallet,
    Users,
    CheckSquare,
    Target
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { kernelAPI, tasksAPI } from '../api';


const CircularProgress = ({ value, color, showLabel = true, size = 180 }) => {
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="46"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800/40"
                />
                <motion.circle
                    cx="50"
                    cy="50"
                    r="46"
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="289"
                    initial={{ strokeDashoffset: 289 }}
                    animate={{ strokeDashoffset: 289 - (289 * value) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-display font-bold text-slate-800 dark:text-white leading-none">
                        {Math.round(value)}
                    </span>
                </div>
            )}
        </div>
    );
};

export function DashboardModule({ user, setActiveTab, onUpdate, isDarkMode }) {
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [trendPeriod, setTrendPeriod] = useState('daily');

    const fetchEvents = async () => {
        try {
            const [eventsRes, tasksRes] = await Promise.all([
                kernelAPI.getEvents(),
                tasksAPI.getTasks ? tasksAPI.getTasks() : Promise.resolve({ data: [] })
            ]);
            setEvents(eventsRes.data);
            setTasks(tasksRes.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user]);

    const handleDeleteEvent = async (id) => {
        if (!confirm('Delete this event log?')) return;
        try {
            await kernelAPI.deleteEvent(id);
            fetchEvents();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete event', err);
        }
    };

    const handleToggleTask = async (id) => {
        try {
            await tasksAPI.toggleTask(id);
            fetchEvents();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to toggle task', err);
        }
    };

    const handleDeleteTask = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Delete this task?')) return;
        try {
            await tasksAPI.deleteTask(id);
            fetchEvents();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete task', err);
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

    // Filter tasks for today or pending
    const pendingTasks = tasks.filter(t => t.status !== 'done');

    // Process Trend Data
    const getTrendData = () => {
        if (!events.length) return [];

        if (trendPeriod === 'daily') {
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString('en-US', { weekday: 'short' });
            });

            const counts = events.reduce((acc, event) => {
                const day = new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
                acc[day] = (acc[day] || 0) + (event.impact === 'positive' ? 1 : event.impact === 'negative' ? -1 : 0);
                return acc;
            }, {});

            return last7Days.map(day => ({
                name: day,
                performance: Math.min(100, Math.max(0, (counts[day] || 0) * 20))
            }));
        } else {
            // Real Weekly logic: Group events into the last 4 weeks
            const weeks = [...Array(4)].map((_, i) => {
                const start = new Date();
                start.setDate(start.getDate() - (27 - (i * 7))); // 4 weeks ago
                return {
                    label: `Week ${i + 1}`,
                    start: new Date(start.setHours(0, 0, 0, 0)),
                    end: new Date(new Date(start).setDate(start.getDate() + 6))
                };
            });

            return weeks.map((w, i) => {
                const weekEvents = events.filter(e => {
                    const d = new Date(e.timestamp);
                    return d >= w.start && d <= w.end;
                });

                // Labels: 3w ago, 2w ago, Last Week, Current
                const labels = ['3w ago', '2w ago', 'Last Week', 'Current'];

                // Calculate average impact for the week
                const totalImpact = weekEvents.reduce((acc, e) =>
                    acc + (e.impact === 'positive' ? 20 : e.impact === 'negative' ? -20 : 0), 0
                );

                // Cap at 100, normalize for the 7-day period
                const perf = Math.min(100, Math.max(0, weekEvents.length > 0 ? totalImpact / 7 : 0));

                return {
                    name: labels[i],
                    performance: Math.round(perf)
                };
            });
        }
    };

    const trendData = getTrendData();

    // Calculate Trend
    const calculateTrend = () => {
        if (events.length < 5) return { value: 0, label: 'Awaiting data', status: 'neutral' };

        const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const oldestEventDate = new Date(sortedEvents[0].timestamp);
        const daysSinceStart = Math.ceil((new Date().getTime() - oldestEventDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceStart < 2) return { value: 0, label: 'Starting journey', status: 'neutral' };

        // Simple trend: net impact of last 48h vs total
        const recentEvents = events.filter(e => {
            const date = new Date(e.timestamp);
            const now = new Date();
            return (now.getTime() - date.getTime()) < (48 * 60 * 60 * 1000);
        });

        const recentImpact = recentEvents.reduce((acc, e) => acc + (e.impact === 'positive' ? 1 : -1), 0);

        if (recentImpact > 0) return { value: Math.abs(recentImpact), label: `+${recentImpact}% momentum`, status: 'positive' };
        if (recentImpact < 0) return { value: Math.abs(recentImpact), label: `${recentImpact}% dip`, status: 'negative' };
        return { value: 0, label: 'Stably performing', status: 'neutral' };
    };

    const trend = calculateTrend();

    return (
        <div className="space-y-10 pb-16">
            {/* Page Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Life Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">Your unified life performance overview</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Current Session</p>
                    <p className="text-lg font-bold text-[#0f172a] dark:text-white">{today}</p>
                </div>
            </div>

            {/* Dashboard Hero Card */}
            <div className="glass-card p-1 pb-1 overflow-hidden relative border-none shadow-2xl shadow-blue-900/10">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Gauge Section */}
                    <div className="lg:col-span-4 p-10 flex flex-col items-center justify-center border-r border-slate-100 dark:border-white/[0.05]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-10 w-full text-left ml-4">Life Performance Index</h3>
                        <div className="relative">
                            <CircularProgress value={user?.lifeScore || 0} color="#10b981" />
                            {trend.status === 'positive' && (
                                <div className="absolute top-0 -right-4 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black backdrop-blur-md border border-emerald-500/20 flex items-center gap-1">
                                    <TrendingUp size={10} /> +{trend.value}%
                                </div>
                            )}
                        </div>
                        <div className="mt-10 text-center">
                            <h4 className="text-2xl font-display font-bold text-[#0f172a] dark:text-white mb-2">You're doing great!</h4>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{today}</p>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="lg:col-span-8 p-10 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-4">7-Day Trend</h3>
                            <div className="flex bg-slate-100/50 dark:bg-white/[0.03] p-1 rounded-xl border border-slate-200/50 dark:border-white/[0.05]">
                                <button onClick={() => setTrendPeriod('daily')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${trendPeriod === 'daily' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>DAILY</button>
                                <button onClick={() => setTrendPeriod('weekly')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${trendPeriod === 'weekly' ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>WEEKLY</button>
                            </div>
                        </div>
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.05)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="performance"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fill="url(#colorWave)"
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Sleep', value: '7.5h', icon: '🌙', trend: '+8%' },
                    { label: 'Water', value: '2.1L', icon: '💧', trend: '+12%' },
                    { label: 'Mood', value: '8/10', icon: '😊', trend: '+5%' },
                    { label: 'Streak', value: '12d', icon: '🔥', trend: '+20%' }
                ].map((stat) => (
                    <motion.div
                        key={stat.label}
                        whileHover={{ y: -5 }}
                        className="glass-card p-6 border-none flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xl">{stat.icon}</span>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.trend}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-display font-bold text-[#0f172a] dark:text-white leading-none">{stat.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Middle Row: Module Scores */}
            <div className="space-y-6">
                {/* Your Modules Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-display font-bold text-[#0f172a] dark:text-white">Your Modules</h3>
                        <button className="text-[10px] font-black text-slate-400 hover:text-blue-500 transition-colors tracking-widest uppercase">View all ↗</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {[
                            { name: 'Health', score: user?.healthScore || 0, color: '#10b981', icon: Heart, tab: 'health' },
                            { name: 'Wealth', score: user?.wealthScore || 0, color: '#3b82f6', icon: Wallet, tab: 'wealth' },
                            { name: 'Relationships', score: user?.relationshipScore || 0, color: '#f43f5e', icon: Users, tab: 'relationships' },
                            { name: 'Habits', score: user?.habitScore || 0, color: '#f59e0b', icon: CheckSquare, tab: 'habits' },
                            { name: 'Purpose', score: user?.goalScore || 0, color: '#8b5cf6', icon: Target, tab: 'goals' },
                        ].map((module) => (
                            <motion.div
                                key={module.name}
                                whileHover={{ y: -8 }}
                                onClick={() => setActiveTab && setActiveTab(module.tab)}
                                className="glass-card p-8 border-none group cursor-pointer relative overflow-hidden"
                            >
                                {/* Accent Bar */}
                                <div className="absolute right-4 bottom-4 w-1.5 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ backgroundColor: module.color }} />

                                <div className="p-4 rounded-2xl mb-6 shadow-inner inline-flex" style={{ backgroundColor: `${module.color}15`, color: module.color }}>
                                    <module.icon size={26} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-none">
                                        {Math.round(module.score)}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4">
                                        {module.name}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Detailed Metrics & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Today's Tasks */}
                <div className="lg:col-span-12 glass-card p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Today's Tasks</h3>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{pendingTasks.length} pending</span>
                    </div>
                    {tasks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tasks.map((task) => (
                                <motion.div
                                    key={task._id}
                                    whileHover={{ x: 5 }}
                                    onClick={() => handleToggleTask(task._id)}
                                    className="flex items-center justify-between p-5 glass rounded-2xl group interactive-hover cursor-pointer border-transparent"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' :
                                            task.priority === 'medium' ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'bg-slate-300'
                                            }`} />
                                        <span className={`text-sm font-bold transition-all ${task.status === 'done' ? 'text-slate-400 line-through opacity-50' : 'text-[#0f172a] dark:text-white'}`}>
                                            {task.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={(e) => handleDeleteTask(task._id, e)}
                                            className="w-8 h-8 rounded-xl text-red-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                                            title="Delete Task"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${task.status === 'done' ? 'bg-[#10b981] border-[#10b981] shadow-lg shadow-green-200 dark:shadow-none' : 'border-slate-200 dark:border-slate-700 group-hover:border-blue-500/50'}`}>
                                            {task.status === 'done' && <CheckCircle2 size={16} className="text-white" />}
                                        </div>
                                    </div>
                                </motion.div>
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
                <div className="lg:col-span-12 glass-card p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Recent Activity</h3>
                            <button
                                onClick={handleDeleteAllLogs}
                                className="text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1 rounded-full border border-red-100 dark:border-red-900/30 transition-all uppercase tracking-widest"
                            >
                                Delete All Logs
                            </button>
                        </div>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{events.length} logs</span>
                    </div>
                    {events.length > 0 ? (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                            {events.map((event) => (
                                <motion.div
                                    key={event._id}
                                    whileHover={{ x: 5 }}
                                    className="flex items-center justify-between p-5 glass rounded-2xl group interactive-hover"
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm transition-colors duration-300">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#0f172a] dark:text-white">{event.title}</h4>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{new Date(event.timestamp).toLocaleString()}</p>
                                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${event.impact === 'positive' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                                                    {event.impact}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteEvent(event._id); }}
                                        className="p-2.5 bg-white/80 dark:bg-slate-900/80 text-red-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 rounded-xl transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer relative z-20"
                                        title="Delete Activity"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </motion.div>
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

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


const CircularProgress = ({ value, color, showLabel = true }) => {
    return (
        <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                {/* Visual Depth Well */}
                <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="currentColor"
                    className="text-white/20 dark:text-slate-800/20"
                />
                {/* Main Track */}
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800/50"
                />
                {/* Dynamic Progress Arc */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={color}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="251.3"
                    initial={{ strokeDashoffset: 251.3 }}
                    animate={{ strokeDashoffset: 251.3 - (251.3 * value) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-display font-bold text-slate-800 dark:text-white leading-none">
                        {Number.isInteger(value) ? value : Number(value).toFixed(1)}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Score</span>
                </div>
            )}
        </div>
    );
};

export function DashboardModule({ user, setActiveTab, onUpdate }) {
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
        <div className="space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white">Life Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Your unified life performance overview</p>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 font-semibold text-sm">
                    <span>{today}</span>
                </div>
            </div>

            {/* Top Row: Unified Score & Weekly Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <motion.div
                    whileHover={{ y: -8, scale: 1.01 }}
                    className="lg:col-span-4 glass-card p-10 flex flex-col items-center justify-center transition-all duration-500 bg-white/40 dark:bg-surface/40"
                >
                    <h3 className="text-xl font-display font-bold text-[#0f172a] dark:text-white mb-8">Unified Life Score</h3>
                    <div className="relative p-6 rounded-full bg-white/20 dark:bg-slate-800/20 backdrop-blur-xl border border-white/30 dark:border-slate-700/30 shadow-inner">
                        <CircularProgress value={user?.lifeScore || 0} color="#10b981" />
                    </div>
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold tracking-tight">Your overall life performance</p>
                        <div className={`flex items-center justify-center space-x-1 mt-3 font-bold text-sm ${trend.status === 'positive' ? 'text-green-500' : trend.status === 'negative' ? 'text-rose-500' : 'text-slate-400'}`}>
                            {trend.status !== 'neutral' && <TrendingUp size={16} className={trend.status === 'negative' ? 'rotate-180' : ''} />}
                            <span className="uppercase tracking-widest text-[10px]">{trend.label}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="lg:col-span-8 glass-card p-10 min-h-[400px] bg-white/40 dark:bg-surface/40 transition-all duration-500"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">{trendPeriod === 'daily' ? 'Daily' : 'Weekly'} Performance</h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Efficiency Trends</p>
                        </div>
                        <div className="flex bg-slate-50/50 dark:bg-[#0f111a]/50 p-1.5 rounded-2xl border border-slate-200/60 dark:border-[#222436] backdrop-blur-sm">
                            <button
                                onClick={() => setTrendPeriod('daily')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${trendPeriod === 'daily' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200/50 dark:border-slate-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => setTrendPeriod('weekly')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${trendPeriod === 'weekly' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200/50 dark:border-slate-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                            >
                                Weekly
                            </button>
                        </div>
                    </div>
                    <div className="h-[280px] w-full mt-4">
                        {events.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 10, fontWeight: 700 }}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#3b82f6' }}
                                    />
                                    <Area
                                        type="monotoneX"
                                        dataKey="performance"
                                        stroke="#3b82f6"
                                        strokeWidth={5}
                                        fillOpacity={1}
                                        fill="url(#colorPerf)"
                                        dot={{ r: 5, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                <Activity size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Collect data to see metrics</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Middle Row: Module Scores */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-bold text-[#0f172a] dark:text-white">Your Modules</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        {
                            name: 'Health',
                            score: user?.healthScore || 0,
                            color: 'emerald',
                            icon: Heart,
                            tab: 'health',
                            gradient: 'from-emerald-500/20 to-emerald-500/5',
                            shadow: 'shadow-emerald-200/40 dark:shadow-none'
                        },
                        {
                            name: 'Wealth',
                            score: user?.wealthScore || 0,
                            color: 'blue',
                            icon: Wallet,
                            tab: 'wealth',
                            gradient: 'from-blue-500/20 to-blue-500/5',
                            shadow: 'shadow-blue-200/40 dark:shadow-none'
                        },
                        {
                            name: 'Relationships',
                            score: user?.relationshipScore || 0,
                            color: 'rose',
                            icon: Users,
                            tab: 'relationships',
                            gradient: 'from-rose-500/20 to-rose-500/5',
                            shadow: 'shadow-rose-200/40 dark:shadow-none'
                        },
                        {
                            name: 'Habits',
                            score: user?.habitScore || 0,
                            color: 'amber',
                            icon: CheckSquare,
                            tab: 'habits',
                            gradient: 'from-amber-500/20 to-amber-500/5',
                            shadow: 'shadow-amber-200/40 dark:shadow-none'
                        },
                        {
                            name: 'Purpose',
                            score: user?.goalScore || 0,
                            color: 'violet',
                            icon: Target,
                            tab: 'goals',
                            gradient: 'from-violet-500/20 to-violet-500/5',
                            shadow: 'shadow-violet-200/40 dark:shadow-none'
                        },
                    ].map((module) => {
                        const Icon = module.icon;
                        const colorClass = {
                            emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                            blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                            rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                            amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                            violet: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
                        }[module.color];

                        const barClass = {
                            emerald: 'bg-emerald-500',
                            blue: 'bg-blue-500',
                            rose: 'bg-rose-500',
                            amber: 'bg-amber-500',
                            violet: 'bg-violet-500',
                        }[module.color];

                        return (
                            <motion.div
                                key={module.name}
                                whileHover={{ y: -12, scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab && setActiveTab(module.tab)}
                                className={`relative group cursor-pointer glass p-8 rounded-[2.5rem] h-[180px] transition-all duration-500 border border-black ${module.shadow}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]`} />

                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="flex items-start justify-between">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border backdrop-blur-md transition-all duration-500 group-hover:scale-110 ${colorClass}`}>
                                            <Icon size={24} />
                                        </div>
                                        <div className={`w-1.5 h-10 rounded-full ${barClass} opacity-60 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all`} />
                                    </div>

                                    <div>
                                        <div className="text-4xl font-display font-bold text-slate-800 dark:text-white leading-none tracking-tight">
                                            {Math.round(module.score)}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-[0.2em] transition-colors group-hover:text-slate-500">
                                            {module.name}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
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

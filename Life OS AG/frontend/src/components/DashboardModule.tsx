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
    Target,
    ArrowUpRight
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
                    <span
                        className="font-display font-bold text-slate-800 dark:text-white"
                        style={{ fontSize: `${size * 0.22}px` }}
                    >
                        {Number.isInteger(value) ? value : Number(value).toFixed(1)}
                    </span>
                </div>
            )}
        </div>
    );
};

export function DashboardModule({ user, setActiveTab, onUpdate }: any) {
    const [events, setEvents] = useState<any[]>([]);
    const [trendPeriod, setTrendPeriod] = useState<'daily' | 'weekly'>('daily');

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

    // Empty tasks state for now or fetch from real source if available
    const tasks: any[] = [];

    // Process Trend Data
    const getTrendData = () => {
        if (!events.length) return [];

        if (trendPeriod === 'daily') {
            const last7Days = [...Array(7)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                return d.toLocaleDateString('en-US', { weekday: 'short' });
            });

            const counts = events.reduce((acc: any, event) => {
                const day = new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
                acc[day] = (acc[day] || 0) + (event.impact === 'positive' ? 1 : event.impact === 'negative' ? -1 : 0);
                return acc;
            }, {});

            return last7Days.map(day => ({
                name: day,
                performance: 50 + (counts[day] || 0) * 10 // Baseline of 50 + impact
            }));
        } else {
            // Weekly logic (group by week start)
            const weeks = [...Array(4)].map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (21 - (i * 7)));
                return `Week ${i + 1}`;
            });

            return weeks.map(w => ({
                name: w,
                performance: Math.floor(Math.random() * 20) + 40 // Simulated weekly data for now as fallback
            }));
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
                <div className="lg:col-span-4 bg-white dark:bg-[#1a1c2e] rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-[#222436] flex flex-col items-center justify-center transition-colors duration-300">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Unified Life Score</h3>
                    <CircularProgress value={user?.lifeScore || 0} color="#10b981" size={180} strokeWidth={14} />
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Your overall life performance</p>
                        <div className={`flex items-center justify-center space-x-1 mt-2 font-bold text-sm ${trend.status === 'positive' ? 'text-green-500' : trend.status === 'negative' ? 'text-rose-500' : 'text-slate-400'}`}>
                            {trend.status !== 'neutral' && <TrendingUp size={16} className={trend.status === 'negative' ? 'rotate-180' : ''} />}
                            <span>{trend.label}</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 bg-white dark:bg-[#1a1c2e] rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-[#222436] min-h-[400px] transition-colors duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">{trendPeriod === 'daily' ? 'Daily' : 'Weekly'} Performance</h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Efficiency Trends</p>
                        </div>
                        <div className="flex bg-slate-50 dark:bg-[#0f111a] p-1.5 rounded-2xl border border-slate-100 dark:border-[#222436]">
                            <button
                                onClick={() => setTrendPeriod('daily')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${trendPeriod === 'daily' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => setTrendPeriod('weekly')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${trendPeriod === 'weekly' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Weekly
                            </button>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        {events.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-white/10" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                        className="recharts-cartesian-axis-tick-text"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'rgba(148, 163, 184, 0.8)', fontSize: 10, fontWeight: 700 }}
                                        domain={[0, 100]}
                                        className="recharts-cartesian-axis-tick-text"
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '12px', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#3b82f6' }}
                                        cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="performance"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorPerf)"
                                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <TrendingUp size={48} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium italic">Perform some life actions to generate performance metrics</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Middle Row: Module Scores */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-bold text-[#0f172a] dark:text-white">Your Modules</h3>
                    <button
                        className="text-sm font-semibold text-slate-400 dark:text-slate-500 hover:text-blue-500 transition-colors flex items-center space-x-1"
                        onClick={() => setActiveTab && setActiveTab('ai-insights')}
                    >
                        <span>View all</span>
                        <ArrowUpRight size={14} />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        {
                            name: 'Health',
                            score: user?.healthScore || 0,
                            color: 'emerald',
                            icon: Heart,
                            tab: 'health',
                            gradient: 'from-emerald-500/10 to-transparent',
                            darkGradient: 'dark:from-emerald-500/5 dark:to-[#1a1c2e]'
                        },
                        {
                            name: 'Wealth',
                            score: user?.wealthScore || 0,
                            color: 'blue',
                            icon: Wallet,
                            tab: 'wealth',
                            gradient: 'from-blue-500/10 to-transparent',
                            darkGradient: 'dark:from-blue-500/5 dark:to-[#1a1c2e]'
                        },
                        {
                            name: 'Relationships',
                            score: user?.relationshipScore || 0,
                            color: 'rose',
                            icon: Users,
                            tab: 'relationships',
                            gradient: 'from-rose-500/10 to-transparent',
                            darkGradient: 'dark:from-rose-500/5 dark:to-[#1a1c2e]'
                        },
                        {
                            name: 'Habits',
                            score: user?.habitScore || 0,
                            color: 'amber',
                            icon: CheckSquare,
                            tab: 'habits',
                            gradient: 'from-amber-500/10 to-transparent',
                            darkGradient: 'dark:from-amber-500/5 dark:to-[#1a1c2e]'
                        },
                        {
                            name: 'Purpose',
                            score: user?.goalScore || 0,
                            color: 'violet',
                            icon: Target,
                            tab: 'goals',
                            gradient: 'from-violet-500/10 to-transparent',
                            darkGradient: 'dark:from-violet-500/5 dark:to-[#1a1c2e]'
                        },
                    ].map((module) => {
                        const Icon = module.icon;
                        const colorClass = {
                            emerald: 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5',
                            blue: 'border-blue-500/20 text-blue-500 bg-blue-500/5',
                            rose: 'border-rose-500/20 text-rose-500 bg-rose-500/5',
                            amber: 'border-amber-500/20 text-amber-500 bg-amber-500/5',
                            violet: 'border-violet-500/20 text-violet-500 bg-violet-500/5',
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
                                whileHover={{ y: -4, scale: 1.02 }}
                                onClick={() => setActiveTab && setActiveTab(module.tab)}
                                className={`relative overflow-hidden bg-white dark:bg-[#1a1c2e] border border-slate-100 dark:border-white/5 rounded-[1.5rem] p-6 flex flex-col justify-between h-[160px] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 group`}
                            >
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} ${module.darkGradient} opacity-50`} />

                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="flex items-start justify-between">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className={`w-1.5 h-8 rounded-full ${barClass} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                    </div>

                                    <div>
                                        <div className="text-3xl font-display font-bold text-slate-800 dark:text-white leading-none">
                                            {Math.round(module.score)}
                                        </div>
                                        <div className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tight">
                                            {module.name}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Selection Border */}
                                <div className={`absolute inset-0 border-2 border-transparent group-hover:border-${module.color}-500/20 rounded-[1.5rem] transition-colors pointer-events-none`} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Row: Detailed Metrics & Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Today's Tasks */}
                <div className="lg:col-span-12 bg-white dark:bg-[#1a1c2e] rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-[#222436] transition-colors duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Today's Tasks</h3>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{tasks.length} pending</span>
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
                <div className="lg:col-span-12 bg-white dark:bg-[#1a1c2e] rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-[#222436] transition-colors duration-300">
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
                                <div key={event._id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-[#0f111a]/50 rounded-2xl group hover:bg-slate-100 dark:hover:bg-[#0f111a] transition-colors">
                                    <div className="flex items-center space-x-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1a1c2e] flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm transition-colors">
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
                                        onClick={() => handleDeleteEvent(event._id)}
                                        className="p-2 bg-white dark:bg-[#0f111a] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
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

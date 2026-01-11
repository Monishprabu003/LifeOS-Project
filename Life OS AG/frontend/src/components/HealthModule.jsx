import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Heart,
    Plus,
    Moon,
    Droplets,
    Smile,
    Zap,
    Activity,
    Trash2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { HealthLogModal } from './HealthLogModal';
import { healthAPI } from '../api';

const CircularProgress = ({ value, color, size = 100, strokeWidth = 8 }) => {
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
                    className="text-slate-100 dark:text-white/10"
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
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-display font-bold text-[#0f172a] dark:text-white">{Math.round(value)}</span>
            </div>
        </div>
    );
};

export function HealthModule({ onUpdate, user, isDarkMode }) {
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await healthAPI.getLogs();
            setLogs(res.data);
        } catch (err) {
            console.error('Failed to fetch health logs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLog = async (id) => {
        if (!confirm('Are you sure you want to delete this log?')) return;
        try {
            await healthAPI.deleteLog(id);
            fetchLogs();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete log', err);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [user]);

    // Get latest log for cards
    const latestLog = logs[0] || null;

    // Prepare chart data from logs
    const sleepData = logs.slice(0, 7).reverse().map(log => ({
        name: new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: log.sleepHours || 0
    }));

    const trendData = logs.slice(0, 7).reverse().map(log => ({
        name: new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
        mood: log.mood || 0,
        stress: log.stress || 0
    }));

    // Daily score calculation (simple average for now)
    const dailyScore = latestLog
        ? Math.round(((latestLog.mood * 10) + (latestLog.sleepHours * 10) + (100 - (latestLog.stress * 10)) + (Math.min(latestLog.waterIntake, 2.5) * 40)) / 4)
        : 0;

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                        <Heart size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Health & Wellbeing</h1>
                        <p className="text-slate-500 font-medium mt-1">Track your daily health indicators</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsLogModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center space-x-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={20} />
                    <span>Log Today's Health</span>
                </button>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="glass-card p-8 border-none flex flex-col items-center justify-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 w-full">Daily Health Score</h3>
                    <div className="relative">
                        <CircularProgress value={dailyScore} color="#10b981" />
                    </div>
                    <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Based on today's metrics</p>
                </div>

                {[
                    { label: 'Sleep', value: `${latestLog?.sleepHours || 0} hrs`, icon: Moon, trend: '+8% vs last week', color: 'bg-emerald-900/40' },
                    { label: 'Water', value: `${latestLog?.waterIntake || 0} L`, icon: Droplets, trend: '+12% vs last week', color: 'bg-emerald-900/40' },
                    { label: 'Mood', value: `${latestLog?.mood || 0}/10`, icon: Smile, trend: '+5% vs last week', color: 'bg-emerald-900/40' },
                    { label: 'Stress', value: `${latestLog?.stress || 0}/10`, icon: Zap, trend: '15% vs last week', color: 'bg-emerald-900/40' },
                ].map((stat) => (
                    <div key={stat.label} className={`glass-card p-8 border-none flex flex-col justify-between dark:bg-emerald-950/20`}>
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{stat.label}</span>
                            <stat.icon size={20} className="text-white/40" />
                        </div>
                        <div className="mt-8">
                            <p className="text-2xl font-display font-bold text-[#0f172a] dark:text-white leading-none">{stat.value}</p>
                            <p className="text-[10px] font-bold text-emerald-400 mt-2 uppercase tracking-widest">{stat.trend}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10 border-none">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-10 w-full">Sleep Tracking</h3>
                    <div className="h-[280px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-300">Loading...</div>
                        ) : sleepData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sleepData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.05)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        domain={[0, 12]}
                                        ticks={[0, 3, 6, 9, 12]}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            backgroundColor: '#0f172a',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar dataKey="hours" fill="#10b981" radius={[8, 8, 4, 4]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                <Moon size={40} className="mb-4 text-slate-300" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Log data to see sleep trends</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-10 border-none">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-10 w-full">Mood & Stress Trends</h3>
                    <div className="h-[280px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-300">Loading...</div>
                        ) : trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.05)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        domain={[0, 10]}
                                        ticks={[0, 2, 4, 6, 8, 10]}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: 'none',
                                            backgroundColor: '#0f172a',
                                            color: '#fff'
                                        }}
                                    />
                                    <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', stroke: 'none' }} />
                                    <Line type="monotone" dataKey="stress" stroke="#f43f5e" strokeWidth={4} dot={{ r: 4, fill: '#f43f5e', stroke: 'none' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                <Smile size={40} className="mb-4 text-slate-300" />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Log data to see wellness trends</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Logs Section */}
            <div className="glass-card p-10 border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Recent Logs</h3>
                {logs.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                        {logs.map((log) => (
                            <motion.div
                                key={log._id}
                                whileHover={{ x: 5 }}
                                className="p-8 glass rounded-[2rem] group relative interactive-hover"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sleep Cycle</p>
                                            <p className="text-lg font-display font-bold text-[#0f172a] dark:text-white mt-2 leading-none">{log.sleepHours}h</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hydration</p>
                                            <p className="text-lg font-display font-bold text-[#0f172a] dark:text-white mt-2 leading-none">{log.waterIntake}L</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wellness Level</p>
                                            <p className="text-lg font-display font-bold text-[#0f172a] dark:text-white mt-2 leading-none">{log.mood}/{log.stress}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Log Timestamp</p>
                                            <p className="text-xs font-bold text-slate-500 mt-2">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteLog(log._id); }}
                                        className="p-3 bg-white/80 dark:bg-slate-900/80 text-red-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 rounded-2xl transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-800"
                                        title="Delete Log"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] opacity-30">
                        <Activity size={40} className="mx-auto mb-4 text-slate-200" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No health logs found</p>
                    </div>
                )}
            </div>

            {/* Health Habits Section */}
            <div className="glass-card p-10 border-none">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 w-full">Health Habits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: 'Morning Meditation', streak: '12 day streak 🔥', done: true },
                        { name: '30 Min Workout', streak: '8 day streak 🔥', done: false },
                        { name: '10K Steps', streak: '5 day streak 🔥', done: false }
                    ].map((habit) => (
                        <div key={habit.name} className={`p-6 rounded-2xl border ${habit.done ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-100/50 dark:bg-white/[0.03] border-transparent'} flex items-center justify-between transition-all cursor-pointer`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${habit.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-white/5 text-slate-500'}`}>
                                    <Zap size={18} />
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${habit.done ? 'text-[#0f172a] dark:text-white' : 'text-slate-500'}`}>{habit.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{habit.streak}</p>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${habit.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-white/10'}`}>
                                {habit.done && <Plus size={14} className="text-white rotate-45" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <HealthLogModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                onSave={async (data) => {
                    await healthAPI.createLog(data);
                    fetchLogs();
                    if (onUpdate) onUpdate();
                    setIsLogModalOpen(false);
                }}
            />
        </div>
    );
}

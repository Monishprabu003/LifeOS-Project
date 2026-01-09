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

const CircularProgress = ({ value, color, size = 120, strokeWidth = 10, label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size + 40 }}>
            <div className="relative" style={{ width: size, height: size }}>
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
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-display font-bold text-[#0f172a] dark:text-white">{value}</span>
                </div>
            </div>
            {label && <p className="mt-4 text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider">{label}</p>}
        </div>
    );
};

export function HealthModule({ onUpdate, user }) {
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
                    <div className="w-16 h-16 rounded-2xl bg-[#10b981] flex items-center justify-center text-white shadow-lg shadow-green-100">
                        <Heart size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Health & Wellbeing</h1>
                        <p className="text-slate-500 font-medium mt-1">Track your daily health indicators</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsLogModalOpen(true)}
                    className="bg-[#10b981] hover:bg-[#0da271] text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 transition-all shadow-lg shadow-green-100 dark:shadow-none"
                >
                    <Plus size={20} />
                    <span>Log Today's Health</span>
                </button>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <motion.div
                    whileHover={{ y: -5, scale: 1.01 }}
                    className="md:col-span-1 glass-card p-8 flex flex-col items-center transition-all duration-500"
                >
                    <h3 className="text-sm font-bold text-[#0f172a] dark:text-white mb-8 self-start">Daily Health Score</h3>
                    <CircularProgress value={dailyScore} color="#10b981" size={120} label={latestLog ? "Based on today's metrics" : "Log data to see score"} />
                </motion.div>

                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass p-8 relative group cursor-pointer interactive-hover rounded-[2.5rem] bg-emerald-50/20 dark:bg-emerald-500/5"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sleep</p>
                            <h4 className="text-2xl font-display font-bold text-[#0f172a] dark:text-white mt-2">{latestLog?.sleepHours || 0}h</h4>
                        </div>
                        <Activity size={24} className="text-[#10b981] opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass p-8 relative group cursor-pointer interactive-hover rounded-[2.5rem] bg-blue-50/20 dark:bg-blue-500/5"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Water</p>
                            <h4 className="text-2xl font-display font-bold text-[#0f172a] dark:text-white mt-2">{latestLog?.waterIntake || 0}L</h4>
                        </div>
                        <Activity size={24} className="text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass p-8 relative group cursor-pointer interactive-hover rounded-[2.5rem] bg-purple-50/20 dark:bg-purple-500/5"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mood</p>
                            <h4 className="text-2xl font-display font-bold text-[#0f172a] dark:text-white mt-2">{latestLog?.mood || 0}/10</h4>
                        </div>
                        <Activity size={24} className="text-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass p-8 relative group cursor-pointer interactive-hover rounded-[2.5rem] bg-red-50/20 dark:bg-red-500/5"
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stress</p>
                            <h4 className="text-2xl font-display font-bold text-[#0f172a] dark:text-white mt-2">{latestLog?.stress || 0}/10</h4>
                        </div>
                        <Activity size={24} className="text-red-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-10">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Sleep Tracking</h3>
                    <div className="h-[280px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-300">Loading...</div>
                        ) : sleepData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sleepData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                        domain={[0, 12]}
                                        ticks={[0, 3, 6, 9, 12]}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                                    />
                                    <Bar dataKey="hours" fill="#10b981" radius={[8, 8, 8, 8]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <Moon size={40} className="mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium">Log your first entry to see sleep trends</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-10">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Mood & Stress Trends</h3>
                    <div className="h-[280px] w-full">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-slate-300">Loading...</div>
                        ) : trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                        domain={[0, 10]}
                                        ticks={[0, 2, 4, 6, 8, 10]}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                                    />
                                    <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                                    <Line type="monotone" dataKey="stress" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <Smile size={40} className="mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium">Trends will appear here after your first log</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Logs Section */}
            <div className="glass-card p-10">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Recent Logs</h3>
                {logs.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
                        {logs.map((log) => (
                            <motion.div
                                key={log._id}
                                whileHover={{ x: 5 }}
                                className="p-6 glass rounded-2xl group relative interactive-hover"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sleep</p>
                                            <p className="text-sm font-bold text-[#0f172a] dark:text-white mt-1">{log.sleepHours}h</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Water</p>
                                            <p className="text-sm font-bold text-[#0f172a] dark:text-white mt-1">{log.waterIntake}L</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mood/Stress</p>
                                            <p className="text-sm font-bold text-[#0f172a] dark:text-white mt-1">{log.mood}/{log.stress}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged At</p>
                                            <p className="text-sm font-bold text-[#0f172a] dark:text-white mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteLog(log._id); }}
                                        className="p-2.5 bg-white/80 dark:bg-slate-900/80 text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 rounded-xl transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-800"
                                        title="Delete Log"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center opacity-40">
                        <Activity size={40} className="mx-auto mb-4 text-slate-200" />
                        <p className="text-slate-500 font-medium text-sm">No health logs found. Log your first entry!</p>
                    </div>
                )}
            </div>

            {/* Health Habits Section (Locked to Real Habits later) */}
            <div className="glass-card p-10">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Health Habit Progress</h3>
                <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                    <Zap size={40} className="mx-auto mb-4 text-slate-200" />
                    <p className="text-slate-400 font-medium text-sm">Create health-focused rituals in the Habits module<br />to track your streaks here.</p>
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

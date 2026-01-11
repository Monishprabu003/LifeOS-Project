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


const CircularProgress = ({ value, color, size = 180 }) => {
    return (
        <div className="relative flex items-center justify-center font-display" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                    fill="transparent"
                    className="dark:stroke-slate-800"
                />
                <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke={color}
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray="276"
                    initial={{ strokeDashoffset: 276 }}
                    animate={{ strokeDashoffset: 276 - (276 * value) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-slate-800 dark:text-white leading-none">
                    {Math.round(value)}
                </span>
            </div>
        </div>
    );
};

export function DashboardModule({ user, setActiveTab, isDarkMode }) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
    });

    const trendData = [
        { name: 'Tue', performance: 65 },
        { name: 'Wed', performance: 72 },
        { name: 'Thu', performance: 68 },
        { name: 'Fri', performance: 75 },
        { name: 'Sat', performance: 82 },
        { name: 'Sun', performance: 88 },
    ];

    return (
        <div className="space-y-12">
            {/* Main Hero Card */}
            <div className="bg-[#f1f5f9] dark:bg-slate-900/40 rounded-[2.5rem] p-12 relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Gauge Section */}
                    <div className="lg:col-span-4 flex flex-col items-center text-center">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b] mb-12 self-start opacity-70">Life Performance Index</h3>
                        <div className="relative">
                            <CircularProgress value={78} color="#10b981" />
                            <div className="absolute top-2 -right-8 bg-[#dcfce7] dark:bg-emerald-500/10 text-[#059669] px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm border border-emerald-500/10 transition-all hover:scale-110">
                                <TrendingUp size={12} strokeWidth={3} /> +5%
                            </div>
                        </div>
                        <div className="mt-12 text-left w-full">
                            <h4 className="text-3xl font-bold text-[#0f172a] dark:text-white mb-2 tracking-tight">You're doing great!</h4>
                            <p className="text-sm font-semibold text-[#64748b] opacity-80">{today}</p>
                        </div>
                    </div>

                    {/* Trend Section */}
                    <div className="lg:col-span-8 flex flex-col h-full justify-between">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748b] opacity-70">7-Day Trend</h3>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                                        dy={15}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="performance"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fill="url(#trendGradient)"
                                        dot={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-bold text-[#0f172a] dark:text-white tracking-tight">Your Modules</h3>
                    <button className="text-xs font-bold text-[#64748b] hover:text-indigo-600 transition-colors flex items-center gap-1">
                        View all <span className="text-lg leading-none">↗</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                        { name: 'Health', score: 85, color: '#10b981', icon: Heart, tab: 'health' },
                        { name: 'Wealth', score: 72, color: '#3b82f6', icon: Wallet, tab: 'wealth' },
                        { name: 'Relationships', score: 88, color: '#f43f5e', icon: Users, tab: 'relationships' },
                        { name: 'Habits', score: 91, color: '#f59e0b', icon: CheckSquare, tab: 'habits' },
                        { name: 'Purpose', score: 76, color: '#8b5cf6', icon: Target, tab: 'goals' },
                    ].map((mod) => (
                        <div
                            key={mod.name}
                            onClick={() => setActiveTab && setActiveTab(mod.tab)}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-[2rem] p-8 relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
                        >
                            {/* Color Accent Bar */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-l-full" style={{ backgroundColor: mod.color }} />

                            <div className="p-4 rounded-2xl mb-8 inline-flex transition-colors group-hover:bg-slate-50 dark:group-hover:bg-white/5" style={{ backgroundColor: `${mod.color}10`, color: mod.color }}>
                                <mod.icon size={26} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-4xl font-bold text-[#0f172a] dark:text-white tracking-tight leading-none">{mod.score}</span>
                                <span className="text-xs font-bold text-slate-400 mt-4">{mod.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


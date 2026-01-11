import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    Zap,
    Target,
    Activity,
    TrendingUp,
    Brain,
    Lightbulb,
    ArrowRight
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from 'recharts';

export function AIInsightsModule({ user, isDarkMode }) {
    const radarData = [
        { subject: 'Health', A: 85, fullMark: 100 },
        { subject: 'Wealth', A: 70, fullMark: 100 },
        { subject: 'Social', A: 90, fullMark: 100 },
        { subject: 'Purpose', A: 65, fullMark: 100 },
        { subject: 'Habits', A: 80, fullMark: 100 },
        { subject: 'Tasks', A: 75, fullMark: 100 },
    ];

    const barData = [
        { name: 'Mon', confidence: 65 },
        { name: 'Tue', confidence: 72 },
        { name: 'Wed', confidence: 85 },
        { name: 'Thu', confidence: 78 },
        { name: 'Fri', confidence: 90 },
        { name: 'Sat', confidence: 82 },
        { name: 'Sun', confidence: 88 },
    ];

    const insights = [
        { label: 'Core Energy', value: '88%', icon: Zap, color: 'text-amber-500', trend: '+12% focus power' },
        { label: 'Deep Focus', value: '74%', icon: Target, color: 'text-indigo-500', trend: 'Peak: 10am - 12pm' },
        { label: 'Flow Efficiency', value: '92%', icon: Activity, color: 'text-emerald-500', trend: 'High momentum' },
        { label: 'Strategic Growth', value: '68%', icon: TrendingUp, color: 'text-rose-500', trend: 'Action required' },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                        <Sparkles size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">AI Performance Insights</h1>
                        <p className="text-slate-500 font-medium mt-1">Decoding your life performance with neuro-analytics</p>
                    </div>
                </div>
                <div className="flex bg-slate-100/50 dark:bg-white/[0.03] p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/[0.05] backdrop-blur-md">
                    <div className="px-5 py-2 rounded-xl bg-white dark:bg-white/10 shadow-sm">
                        <span className="text-xs font-bold text-indigo-500">LIVE ANALYSIS</span>
                    </div>
                </div>
            </div>

            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 glass-card p-10 flex flex-col items-center border-none overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain size={120} className="text-indigo-500" />
                    </div>
                    <div className="w-full text-left mb-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Biological Balance Radar</h3>
                        <p className="text-2xl font-display font-bold text-[#0f172a] dark:text-white mt-2">Life Equilibrium</p>
                    </div>

                    <div className="w-full h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)"} />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                                />
                                <Radar
                                    name="Performance"
                                    dataKey="A"
                                    stroke="#818cf8"
                                    fill="#818cf8"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                        <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</span>
                            <p className="text-lg font-bold text-emerald-500 mt-1">94.2%</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-slate-100 dark:border-white/5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Coherence</span>
                            <p className="text-lg font-bold text-indigo-500 mt-1">High</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {insights.map((insight) => (
                        <div key={insight.label} className="glass-card p-8 border-none flex flex-col justify-between dark:bg-indigo-950/10 group active:scale-[0.98] transition-all cursor-pointer">
                            <div className="flex justify-between items-start">
                                <div className={`w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center ${insight.color} shadow-inner`}>
                                    <insight.icon size={22} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">{insight.label}</span>
                            </div>
                            <div className="mt-12">
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-display font-bold text-[#0f172a] dark:text-white leading-none">{insight.value}</p>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest flex items-center gap-2">
                                    {insight.trend}
                                    <ArrowRight size={10} className="text-indigo-400" />
                                </p>
                            </div>
                        </div>
                    ))}

                    <div className="md:col-span-2 glass-card p-8 border-none bg-gradient-to-br from-indigo-500 to-violet-600 !text-white relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
                            <Lightbulb size={240} />
                        </div>
                        <div className="relative z-10 w-2/3">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-4">Neural Suggestion</h3>
                            <p className="text-xl font-bold leading-tight">Focus on core social habits during 6pm-8pm to maximize life-alignment score.</p>
                            <button className="mt-8 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                Apply Strategy
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Correlation */}
            <div className="glass-card p-10 border-none relative overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Performance Correlation</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-module efficiency mapping</p>
                    </div>
                    <div className="px-4 py-2 bg-indigo-500/10 text-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                        7-Day Analysis
                    </div>
                </div>

                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '16px', color: '#fff' }}
                                cursor={{ fill: 'rgba(129, 140, 248, 0.05)' }}
                            />
                            <Bar dataKey="confidence" radius={[10, 10, 10, 10]} barSize={40}>
                                {barData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === 4 ? "#818cf8" : "rgba(129, 140, 248, 0.2)"}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 flex items-center gap-8 border-t border-slate-100 dark:border-white/5 pt-8">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Peak Confidence</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-indigo-500/20" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Baseline Coherence</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

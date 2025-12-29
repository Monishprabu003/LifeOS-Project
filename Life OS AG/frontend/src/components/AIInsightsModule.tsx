import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    TrendingUp,
    ArrowRight,
    Brain,
    Zap,
    Users,
    Activity,
    RefreshCw
} from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

export function AIInsightsModule({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);

    const radarData = React.useMemo(() => [
        { subject: 'Health', A: user?.healthScore || 0, fullMark: 100 },
        { subject: 'Wealth', A: user?.wealthScore || 0, fullMark: 100 },
        { subject: 'Relationships', A: user?.relationshipScore || 0, fullMark: 100 },
        { subject: 'Habits', A: user?.habitScore || 0, fullMark: 100 },
        { subject: 'Purpose', A: user?.goalScore || 0, fullMark: 100 },
    ], [user]);

    const lifeScore = user?.lifeScore || 0;
    const hasData = lifeScore > 0;

    const trendData = [
        { name: 'W1', Overall: 70, Health: 65, Wealth: 60, Habits: 80 },
        { name: 'W2', Overall: 75, Health: 70, Wealth: 65, Habits: 85 },
        { name: 'W3', Overall: 80, Health: 75, Wealth: 68, Habits: 82 },
        { name: 'W4', Overall: 82, Health: 80, Wealth: 72, Habits: 88 },
    ];

    const refreshAnalysis = async () => {
        setLoading(true);
        // Simulate API call or call real setup
        setTimeout(() => setLoading(false), 1500);
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <Sparkles size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">AI Insights</h1>
                        <p className="text-slate-500 font-medium mt-1">Weekly analysis and personalized recommendations</p>
                    </div>
                </div>
                <button
                    onClick={refreshAnalysis}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-2xl text-sm font-bold text-[#0f172a] dark:text-white hover:bg-slate-50 transition-all shadow-sm"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Analysis</span>
                </button>
            </div>

            {/* Top Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Weekly Life Score Card */}
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-12 self-start pl-2">Weekly Life Score</h3>

                    <div className="relative flex items-center justify-center mb-10">
                        {/* Circular Progress */}
                        <div className="w-56 h-56 relative flex items-center justify-center">
                            <svg
                                viewBox="0 0 200 200"
                                className="w-full h-full transform -rotate-90 shadow-2xl rounded-full"
                            >
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="85"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-slate-100 dark:text-slate-800"
                                />
                                <motion.circle
                                    cx="100"
                                    cy="100"
                                    r="85"
                                    stroke="#10b981"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={534}
                                    initial={{ strokeDashoffset: 534 }}
                                    animate={{ strokeDashoffset: 534 - (534 * lifeScore) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-display font-bold text-[#0f172a] dark:text-white leading-none">
                                    {lifeScore}
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Points</span>
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-bold text-sm ${hasData ? 'bg-green-50 dark:bg-green-900/10 text-[#10b981]' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                        {hasData ? <TrendingUp size={18} /> : <Activity size={18} />}
                        <span>{hasData ? '+8 points vs last week' : 'No activity logged yet'}</span>
                    </div>
                </div>

                {/* Radar Chart Card */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-2">Life Balance Radar</h3>
                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Current Score"
                                    dataKey="A"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Monthly Trends Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-10">Monthly Trends</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                            <Line type="monotone" dataKey="Overall" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981' }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Health" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="Wealth" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="Habits" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Personalized Insights Section */}
            <div className="space-y-8">
                <div className="flex items-center space-x-3 pl-2">
                    <Brain className="text-[#0ea5e9]" size={24} />
                    <h2 className="text-2xl font-bold text-[#0f172a] dark:text-white">Personalized Insights</h2>
                </div>

                {hasData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sleep Insight */}
                        <div className="bg-[#ecfdf5] dark:bg-green-500/5 rounded-[2rem] p-8 border border-green-100 dark:border-green-900/20">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#10b981] shadow-sm">
                                    <Activity size={20} />
                                </div>
                                <h4 className="font-bold text-[#0f172a] dark:text-white">Sleep & Productivity Connection</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                When you sleep 7+ hours, your habit completion rate increases by <span className="text-[#10b981] font-bold">23%</span>. Last week, your best days aligned with quality sleep.
                            </p>
                            <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl flex items-center space-x-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                                <ArrowRight size={18} className="text-[#10b981]" />
                                <span>Try to maintain 7-8 hours of sleep consistently.</span>
                            </div>
                        </div>

                        {/* Finance Insight */}
                        <div className="bg-[#fffbeb] dark:bg-amber-500/5 rounded-[2rem] p-8 border border-amber-100 dark:border-amber-900/20">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#f59e0b] shadow-sm">
                                    <TrendingUp size={20} />
                                </div>
                                <h4 className="font-bold text-[#0f172a] dark:text-white">Weekend Spending Spike</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                Your expenses tend to increase by <span className="text-[#f59e0b] font-bold">40%</span> on weekends, mainly in entertainment and dining categories.
                            </p>
                            <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl flex items-center space-x-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                                <ArrowRight size={18} className="text-[#f59e0b]" />
                                <span>Consider setting a weekend budget limit.</span>
                            </div>
                        </div>

                        {/* Habits Insight */}
                        <div className="bg-[#ecfdf5] dark:bg-green-500/5 rounded-[2rem] p-8 border border-green-100 dark:border-green-900/20">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#10b981] shadow-sm">
                                    <Zap size={20} />
                                </div>
                                <h4 className="font-bold text-[#0f172a] dark:text-white">Habit Streaks Are Strong</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                You've maintained 3 habits for over 10 days. This consistency is building positive momentum across all areas.
                            </p>
                            <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl flex items-center space-x-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                                <ArrowRight size={18} className="text-[#10b981]" />
                                <span>Keep it up! Consider adding one more habit.</span>
                            </div>
                        </div>

                        {/* Social Insight */}
                        <div className="bg-[#eff6ff] dark:bg-blue-500/5 rounded-[2rem] p-8 border border-blue-100 dark:border-blue-900/20">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#3b82f6] shadow-sm">
                                    <Users size={20} />
                                </div>
                                <h4 className="font-bold text-[#0f172a] dark:text-white">Social Connection Gap</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                You haven't connected with family members in the past week. Regular family contact correlates with higher mood scores.
                            </p>
                            <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl flex items-center space-x-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                                <ArrowRight size={18} className="text-[#3b82f6]" />
                                <span>Schedule a call with a family member today.</span>
                            </div>
                        </div>

                        {/* Strengths Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center space-x-3 mb-8">
                                <TrendingUp className="text-[#10b981]" size={20} />
                                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Strengths This Week</h3>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "Highest habit completion rate this month (91%)",
                                    "Relationship score improved by 10 points",
                                    "Morning routine consistency at 100%"
                                ].map((strength, i) => (
                                    <li key={i} className="flex items-center space-x-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Areas for Improvement Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center space-x-3 mb-8">
                                <TrendingUp className="text-[#f59e0b] rotate-180" size={20} />
                                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Areas for Improvement</h3>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    "Stress levels peaked mid-week",
                                    "Water intake below target on 3 days",
                                    "Learning path progress slowed"
                                ].map((improvement, i) => (
                                    <li key={i} className="flex items-center space-x-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                                        <span>{improvement}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-20 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                        <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-6 text-blue-500">
                            <Brain size={40} className="animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0f172a] dark:text-white mb-4">Aggregating Life Intelligence</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                            Our AI is precisely analyzing your logs to find meaningful patterns.
                            Start logging your habits, health, and finances to unlock personalized insights and hidden trends.
                        </p>
                        <div className="mt-10 flex items-center justify-center space-x-4">
                            <div className="px-5 py-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                0% Data Ready
                            </div>
                            <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: "5%" }}
                                    transition={{ duration: 2 }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

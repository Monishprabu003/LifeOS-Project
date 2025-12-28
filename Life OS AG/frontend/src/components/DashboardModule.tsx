import { motion } from 'framer-motion';
import {
    Zap,
    TrendingUp,
    Moon,
    Droplets,
    Smile,
    CheckCircle2
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const data = [
    { name: 'Mon', score: 72 },
    { name: 'Tue', score: 75 },
    { name: 'Wed', score: 78 },
    { name: 'Thu', score: 74 },
    { name: 'Fri', score: 80 },
    { name: 'Sat', score: 82 },
    { name: 'Sun', score: 85 },
];

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

export function DashboardModule({ user }: any) {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const tasks = [
        { id: 1, title: 'Morning meditation', completed: true, color: 'text-health' },
        { id: 2, title: 'Review monthly budget', completed: false, color: 'text-wealth' },
        { id: 3, title: 'Call mom', completed: true, color: 'text-relationships' },
        { id: 4, title: 'Complete online course module', completed: false, color: 'text-habits' },
        { id: 5, title: '30 min workout', completed: false, color: 'text-health' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Page Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white">Life Dashboard</h1>
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
                    <CircularProgress value={user?.lifeScore || 78} color="#10b981" size={180} strokeWidth={14} />
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm font-medium">Your overall life performance</p>
                        <div className="flex items-center justify-center space-x-1 mt-2 text-[#10b981] font-bold text-sm">
                            <TrendingUp size={16} />
                            <span>+5% from last week</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Weekly Performance</h3>
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Middle Row: Module Scores */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Module Scores</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                        { name: 'Health', score: user?.healthScore || 85, color: '#10b981', bg: 'bg-[#ecfdf5]' },
                        { name: 'Wealth', score: user?.wealthScore || 72, color: '#3b82f6', bg: 'bg-[#eff6ff]' },
                        { name: 'Relationships', score: user?.socialScore || 88, color: '#f43f5e', bg: 'bg-[#fff1f2]' },
                        { name: 'Habits', score: user?.habitScore || 91, color: '#f59e0b', bg: 'bg-[#fffbeb]' },
                        { name: 'Purpose', score: user?.goalScore || 76, color: '#8b5cf6', bg: 'bg-[#f5f3ff]' },
                    ].map((module) => (
                        <div key={module.name} className={`${module.bg} rounded-[2rem] p-6 flex flex-col items-center justify-center group hover:scale-[1.02] transition-transform cursor-pointer`}>
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
                    <div className="bg-[#ecfdf5] rounded-3xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sleep Quality</p>
                                <h4 className="text-2xl font-display font-bold mt-1 text-[#0f172a]">7.5 hrs</h4>
                                <p className="text-[10px] font-bold text-[#10b981] mt-1">+8% vs last week</p>
                            </div>
                            <Moon size={20} className="text-[#10b981]" />
                        </div>
                    </div>
                    <div className="bg-[#eff6ff] rounded-3xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Water Intake</p>
                                <h4 className="text-2xl font-display font-bold mt-1 text-[#0f172a]">2.1 L</h4>
                                <p className="text-[10px] font-bold text-[#10b981] mt-1">+12% vs last week</p>
                            </div>
                            <Droplets size={20} className="text-[#3b82f6]" />
                        </div>
                    </div>
                    <div className="bg-[#fff1f2] rounded-3xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mood Score</p>
                                <h4 className="text-2xl font-display font-bold mt-1 text-[#0f172a]">8/10</h4>
                                <p className="text-[10px] font-bold text-[#10b981] mt-1">+5% vs last week</p>
                            </div>
                            <Smile size={20} className="text-[#f43f5e]" />
                        </div>
                    </div>
                    <div className="bg-[#fffbeb] rounded-3xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Habit Streak</p>
                                <h4 className="text-2xl font-display font-bold mt-1 text-[#0f172a]">12 days</h4>
                                <p className="text-[10px] font-bold text-[#10b981] mt-1">+20% vs last week</p>
                            </div>
                            <Zap size={20} className="text-[#f59e0b]" />
                        </div>
                    </div>
                </div>

                {/* Today's Tasks */}
                <div className="lg:col-span-12 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Today's Tasks</h3>
                        <span className="text-xs font-bold text-slate-400">2/5 completed</span>
                    </div>
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
                </div>
            </div>
        </div>
    );
}

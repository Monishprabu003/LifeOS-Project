import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Target,
    Flag,
    Award,
    BookOpen,
    CheckCircle2,
    Circle,
    Trash2,
    Trophy,
    Rocket
} from 'lucide-react';
import { goalsAPI, tasksAPI } from '../api';

const CircularProgress = ({ value, label }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="currentColor"
                        strokeWidth="5"
                        fill="transparent"
                        className="text-slate-100 dark:text-white/10"
                    />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        stroke="#8b5cf6"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="283"
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 283 - (283 * value) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-bold text-[#0f172a] dark:text-white leading-none">74</span>
                </div>
            </div>
            {label && <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>}
        </div>
    );
};


export function GoalsModule({ onUpdate, user, isDarkMode }) {
    const [goals, setGoals] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState({});

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Career');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('high');

    const fetchGoals = async () => {
        try {
            const res = await goalsAPI.getGoals();
            setGoals(res.data);
        } catch (err) {
            console.error('Failed to fetch goals', err);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, [user]);

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        try {
            await goalsAPI.createGoal({
                title,
                description,
                category,
                deadline: deadline ? new Date(deadline) : undefined,
                priority,
                status: 'active',
                progress: 0
            });
            setShowForm(false);
            setTitle('');
            setDescription('');
            setCategory('Career');
            setDeadline('');
            setPriority('high');
            fetchGoals();
            if (onUpdate) onUpdate();
        } catch {
            alert('Failed to initialize mission');
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!confirm('Are you sure you want to delete this mission?')) return;
        try {
            await goalsAPI.deleteGoal(id);
            fetchGoals();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete goal', err);
        }
    };

    const handleToggleTask = async (taskId) => {
        try {
            await tasksAPI.toggleTask(taskId);
            fetchGoals();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to toggle task', err);
        }
    };

    const handleAddTask = async (goalId) => {
        const taskTitle = newTaskTitle[goalId];
        if (!taskTitle?.trim()) return;

        try {
            await tasksAPI.createTask({
                title: taskTitle,
                goalId,
                priority: 'medium'
            });
            setNewTaskTitle({ ...newTaskTitle, [goalId]: '' });
            fetchGoals();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to add task', err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!confirm('Delete this milestone?')) return;
        try {
            await tasksAPI.deleteTask(taskId);
            fetchGoals();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete task', err);
        }
    };

    const calculateProgress = (goal) => {
        if (!goal.tasks || goal.tasks.length === 0) return goal.progress || 0;
        const completed = goal.tasks.filter(t => t.status === 'done').length;
        return Math.round((completed / goal.tasks.length) * 100);
    };

    const categories = ['Career', 'Skills', 'Health', 'Wealth', 'Personal'];

    // Real stats calculation
    const averageProgress = goals.length > 0
        ? Math.round(goals.reduce((acc, g) => acc + calculateProgress(g), 0) / goals.length)
        : 0;

    const goalScore = averageProgress;

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 rounded-2xl bg-violet-500/15 text-violet-500 flex items-center justify-center border border-violet-500/20">
                        <Flag size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Missions & Goals</h1>
                        <p className="text-slate-500 font-medium mt-1">Define your mission and track your growth</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-violet-500 hover:bg-violet-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center space-x-3 transition-all active:scale-95 shadow-lg shadow-violet-500/20"
                >
                    <Plus size={20} />
                    <span>Define Mission</span>
                </button>
            </div>

            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 glass-card p-10 flex flex-col items-center justify-center border-none">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 w-full">Mission Status</h3>
                    <CircularProgress value={74} label="Strategic Alignment" />
                </div>

                <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Missions', value: goals.length, icon: Target, trend: '+1 vs last month' },
                        { label: 'On Track', value: goals.filter(g => calculateProgress(g) > 50).length, icon: Flag, trend: '85% of total' },
                        { label: 'Completed', value: goals.filter(g => calculateProgress(g) === 100).length, icon: Award, trend: 'Last: AI Project' },
                        { label: 'Average Focus', value: '4.2h', icon: Trophy, trend: 'Deep work daily' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card p-8 border-none flex flex-col justify-between dark:bg-violet-950/20">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-tight w-2/3">{stat.label}</span>
                                <stat.icon size={20} className="text-white/40" />
                            </div>
                            <div className="mt-8">
                                <p className="text-2xl font-display font-bold text-[#0f172a] dark:text-white leading-none">{stat.value}</p>
                                <p className="text-[10px] font-bold text-violet-400 mt-2 uppercase tracking-widest">{stat.trend}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Missions Section */}
            <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Active Missions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {goals.map(goal => (
                        <div key={goal._id} className="glass-card p-8 border-none space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                                        <Rocket size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#0f172a] dark:text-white">{goal.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Dec 31, 2024'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteGoal(goal._id)}
                                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress Momentum</span>
                                    <span className="text-xs font-bold text-violet-400">{calculateProgress(goal)}% COMPLETE</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${calculateProgress(goal)}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800" />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collaborators</span>
                                </div>
                                <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{goal.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Goal Form Modal remains similar ... */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative">
                        <h2 className="text-2xl font-bold mb-8 text-[#0f172a] dark:text-white">Initialize Mission</h2>
                        <form onSubmit={handleCreateGoal} className="space-y-6">
                            <input
                                placeholder="Goal Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none text-[#0f172a] dark:text-slate-200"
                                required
                            />
                            <textarea
                                placeholder="Goal Description (optional)"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none text-[#0f172a] dark:text-slate-200 resize-none h-24"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none text-[#0f172a] dark:text-slate-200"
                                >
                                    {categories.map(c => <option key={c} value={c} className="dark:bg-slate-800">{c}</option>)}
                                </select>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={e => setDeadline(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none text-[#0f172a] dark:text-slate-200"
                                />
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-4 font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 bg-[#8b5cf6] text-white py-4 rounded-2xl font-bold">Start Mission</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

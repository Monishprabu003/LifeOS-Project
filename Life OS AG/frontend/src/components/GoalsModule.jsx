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
    Trophy
} from 'lucide-react';
import { goalsAPI, tasksAPI } from '../api';

const CircularProgress = ({ value, label, size = 160, color = '#8b5cf6' }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                    {/* Depth Well */}
                    <circle
                        cx="50"
                        cy="50"
                        r="48"
                        fill="currentColor"
                        className="text-white/20 dark:text-slate-800/20"
                    />
                    {/* Support Track */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-100 dark:text-slate-800/50"
                    />
                    {/* Glowing Progress Arc */}
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
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-none">{value}</span>
                </div>
            </div>
            {label && <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center max-w-[200px] leading-relaxed">{label}</p>}
        </div>
    );
};


export function GoalsModule({ onUpdate, user }) {
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
                <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-[#8b5cf6] flex items-center justify-center text-white shadow-lg shadow-purple-200 dark:shadow-none">
                        <Target size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Purpose & Career</h1>
                        <p className="text-slate-500 font-medium mt-1">Define your mission and track your growth</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 transition-all shadow-lg shadow-purple-100 dark:shadow-none active:scale-95"
                >
                    <Plus size={20} />
                    <span>New Goal</span>
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    whileHover={{ y: -5, scale: 1.01 }}
                    className="md:col-span-1 glass-card p-10 flex flex-col items-center justify-center text-center transition-all duration-500"
                >
                    <h3 className="text-sm font-bold text-[#0f172a] dark:text-white mb-8">Purpose Score</h3>
                    <CircularProgress value={goalScore} label="Vision Alignment" size={150} strokeWidth={12} />
                </motion.div>

                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass p-8 relative group cursor-pointer interactive-hover rounded-[2.5rem] bg-violet-50/20 dark:bg-violet-500/5 transition-all duration-500"
                >
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Active Goals</p>
                        <Target size={20} className="text-[#8b5cf6] opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="text-5xl font-display font-bold text-[#0f172a] dark:text-white mt-4">{goals.length}</h4>
                </motion.div>

                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass p-8 relative group cursor-pointer interactive-hover rounded-[2.5rem] bg-violet-50/20 dark:bg-violet-500/5 transition-all duration-500"
                >
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Achievements</p>
                        <Trophy size={20} className="text-[#8b5cf6] opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="text-5xl font-display font-bold text-[#0f172a] dark:text-white mt-4">
                        {goals.filter(g => calculateProgress(g) === 100).length}
                    </h4>
                </motion.div>

                <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass p-8 relative group cursor-pointer interactive-hover rounded-[2.5rem] bg-violet-50/20 dark:bg-violet-500/5 transition-all duration-500"
                >
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Total Tasks</p>
                        <BookOpen size={20} className="text-[#8b5cf6] opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-4">
                        <h4 className="text-5xl font-display font-bold text-[#0f172a] dark:text-white">
                            {goals.reduce((s, g) => s + (g.tasks?.length || 0), 0)}
                        </h4>
                    </div>
                </motion.div>
            </div>

            {/* Goals List Section */}
            <div className="glass-card p-10">
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-10 pl-2">Your Goals</h3>
                <div className="space-y-6">
                    {goals.map((goal) => (
                        <motion.div
                            key={goal._id}
                            whileHover={{ y: -10, scale: 1.01 }}
                            className="p-10 glass rounded-[3rem] group relative interactive-hover border-transparent"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                            <Target size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-[#0f172a] dark:text-white">{goal.title}</h4>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{goal.category}</span>
                                                <span className="text-slate-200 dark:text-slate-700 font-bold text-[10px]">•</span>
                                                <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">{goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No Deadline'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">{goal.description}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleDeleteGoal(goal._id)}
                                        className="p-3 bg-white/80 dark:bg-slate-900/80 text-red-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 rounded-2xl transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-800"
                                        title="Delete Goal"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Progress Section */}
                            <div className="mb-10 p-8 bg-slate-50/50 dark:bg-[#0f111a]/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                                <div className="flex justify-between items-end mb-4 px-1">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Goal completion momentum</span>
                                    <span className="text-xs font-bold text-violet-500">{calculateProgress(goal)}%</span>
                                </div>
                                <div className="w-full h-3 bg-white dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${calculateProgress(goal)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pl-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {goal.tasks?.map((task, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ x: 5 }}
                                            onClick={() => handleToggleTask(task._id)}
                                            className="flex items-center justify-between p-5 glass rounded-2xl group interactive-hover cursor-pointer border-transparent"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-3 h-3 rounded-full ${task.status === 'done' ? 'bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                                                <span className={`text-sm font-bold transition-all ${task.status === 'done' ? 'text-slate-400 line-through opacity-50' : 'text-[#0f172a] dark:text-white'}`}>
                                                    {task.title}
                                                </span>
                                            </div>
                                            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${task.status === 'done' ? 'bg-violet-500 border-violet-500 text-white shadow-lg' : 'border-slate-200 dark:border-slate-700 group-hover:border-violet-400'}`}>
                                                {task.status === 'done' && <CheckCircle2 size={16} />}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="flex items-center space-x-3 mt-4 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                                    <input
                                        type="text"
                                        placeholder="Add a milestone..."
                                        value={newTaskTitle[goal._id] || ''}
                                        onChange={(e) => setNewTaskTitle({ ...newTaskTitle, [goal._id]: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(goal._id)}
                                        className="flex-1 bg-transparent border-none text-sm text-slate-600 dark:text-slate-200 outline-none placeholder:text-slate-300"
                                    />
                                    <button onClick={() => handleAddTask(goal._id)} className="p-1 teext-[#8b5cf6] hover:bg-purple-50 rounded-lg">
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
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

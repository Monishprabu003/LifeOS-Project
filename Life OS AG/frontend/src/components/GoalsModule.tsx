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
    Trash2
} from 'lucide-react';
import { goalsAPI, tasksAPI } from '../api';

interface Task {
    _id: string;
    title: string;
    status: 'todo' | 'in_progress' | 'done';
}

interface Goal {
    _id: string;
    title: string;
    category: string;
    deadline: string;
    priority: string;
    status: string;
    progress: number;
    tasks: Task[];
}

export function GoalsModule({ onUpdate, user }: { onUpdate?: () => void, user?: any }) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState<{ [key: string]: string }>({});

    // Form State
    const [title, setTitle] = useState('');
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

    const handleCreateGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await goalsAPI.createGoal({
                title,
                category,
                deadline: deadline ? new Date(deadline) : undefined,
                priority,
                status: 'active',
                progress: 0
            });
            setShowForm(false);
            setTitle('');
            setCategory('Career');
            setDeadline('');
            setPriority('high');
            fetchGoals();
            if (onUpdate) onUpdate();
        } catch {
            alert('Failed to initialize mission');
        }
    };

    const handleDeleteGoal = async (id: string) => {
        if (!confirm('Are you sure you want to delete this mission?')) return;
        try {
            await goalsAPI.deleteGoal(id);
            fetchGoals();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete goal', err);
        }
    };

    const handleToggleTask = async (taskId: string) => {
        try {
            await tasksAPI.toggleTask(taskId);
            fetchGoals();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to toggle task', err);
        }
    };

    const handleAddTask = async (goalId: string) => {
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

    const categories = ['Career', 'Skills', 'Health', 'Wealth', 'Personal'];

    // Real stats calculation
    const averageProgress = goals.length > 0
        ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
        : 0;

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
                <div className="bg-[#f5f3ff] dark:bg-slate-900 rounded-[2.5rem] p-8 border border-purple-50 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-bold text-[#0f172a] dark:text-white mb-6">Purpose Score</h3>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-purple-50 dark:text-slate-800" />
                            <circle cx="64" cy="64" r="58" stroke="#8b5cf6" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * averageProgress) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <span className="absolute text-4xl font-display font-bold text-[#0f172a] dark:text-white">{averageProgress}</span>
                    </div>
                    <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Based on real goal completion</p>
                </div>

                <div className="bg-[#f5f3ff] dark:bg-slate-900 rounded-[2.5rem] p-8 border border-purple-50 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Active Goals</p>
                        <Flag size={20} className="text-[#8b5cf6]" />
                    </div>
                    <h4 className="text-5xl font-display font-bold text-[#0f172a] dark:text-white mt-4">{goals.length}</h4>
                </div>

                <div className="bg-[#f5f3ff] dark:bg-slate-900 rounded-[2.5rem] p-8 border border-purple-50 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Achievements</p>
                        <Award size={20} className="text-[#8b5cf6]" />
                    </div>
                    <h4 className="text-5xl font-display font-bold text-[#0f172a] dark:text-white mt-4">
                        {goals.filter(g => g.progress === 100).length}
                    </h4>
                </div>

                <div className="bg-[#f5f3ff] dark:bg-slate-900 rounded-[2.5rem] p-8 border border-purple-50 dark:border-slate-800 shadow-sm flex flex-col justify-between text-left">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Total Tasks</p>
                        <BookOpen size={20} className="text-[#8b5cf6]" />
                    </div>
                    <div className="mt-4">
                        <h4 className="text-5xl font-display font-bold text-[#0f172a] dark:text-white">
                            {goals.reduce((s, g) => s + (g.tasks?.length || 0), 0)}
                        </h4>
                    </div>
                </div>
            </div>

            {/* Goals List Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-10 pl-2">Your Goals</h3>
                <div className="space-y-6">
                    {goals.map(goal => (
                        <div key={goal._id} className="p-8 border border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900 shadow-sm border-b-2">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-xl font-bold text-[#0f172a] dark:text-white">{goal.title}</h4>
                                    <div className="flex items-center space-x-3 mt-2">
                                        <span className="bg-[#f5f3ff] text-[#8b5cf6] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{goal.category}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-2xl font-display font-bold text-[#8b5cf6]">{goal.progress}%</span>
                                    <button
                                        onClick={() => handleDeleteGoal(goal._id)}
                                        className="p-2 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                                        title="Delete Goal"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="w-full h-2.5 bg-purple-50 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${goal.progress}%` }} className="h-full bg-[#10b981] rounded-full" />
                            </div>

                            <div className="space-y-3 pl-1">
                                {(goal.tasks || []).map((task) => (
                                    <div key={task._id} className="flex items-center justify-between group">
                                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleToggleTask(task._id)}>
                                            {task.status === 'done' ? <CheckCircle2 size={18} className="text-[#8b5cf6]" /> : <Circle size={18} className="text-slate-300" />}
                                            <span className={`text-sm font-medium ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}`}>{task.title}</span>
                                        </div>
                                    </div>
                                ))}

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
                            <input placeholder="Goal Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none" required />
                            <div className="grid grid-cols-2 gap-4">
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none">
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm outline-none" />
                            </div>
                            <div className="flex space-x-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                                <button className="flex-1 bg-[#8b5cf6] text-white py-4 rounded-2xl font-bold">Start Mission</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

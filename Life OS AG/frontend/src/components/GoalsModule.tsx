import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    Calendar,
    AlertCircle,
    Trophy,
    Zap
} from 'lucide-react';
import { goalsAPI } from '../api';

export function GoalsModule() {
    const [goals, setGoals] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Career');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('high');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await goalsAPI.getGoals();
            setGoals(res.data);
        } catch (err) {
            console.error('Failed to fetch goals', err);
        }
    };

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
        } catch (err) {
            alert('Failed to initialize mission');
        }
    };

    const updateProgress = async (id: string, current: number) => {
        try {
            const next = Math.min(current + 10, 100);
            await goalsAPI.updateProgress(id, next);
            fetchGoals();
        } catch (err) {
            console.error('Progress update failed', err);
        }
    };

    const categories = ['Career', 'Health', 'Wealth', 'Skills', 'Personal'];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">Mission Control</h2>
                    <p className="text-slate-400 mt-1">Strategic roadmap and purpose alignment.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-goals hover:bg-goals/90 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 shadow-lg shadow-goals/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-bold">Initialize Mission</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Active Missions Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {goals.filter(g => g.status === 'active').map((goal) => (
                            <motion.div
                                key={goal._id}
                                layoutId={goal._id}
                                className="glass rounded-3xl p-8 border-white/5 group hover:border-goals/30 transition-all"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${goal.priority === 'high' ? 'bg-relationships/20 text-relationships' : 'bg-slate-800 text-slate-400'
                                        }`}>
                                        {goal.priority} Priority
                                    </div>
                                    <button
                                        onClick={() => updateProgress(goal._id, goal.progress)}
                                        className="p-2 bg-goals/10 rounded-xl text-goals opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
                                <p className="text-slate-500 text-sm mb-6">{goal.category}</p>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-2xl font-display font-bold text-white">{goal.progress}%</span>
                                        <span className="text-xs text-slate-500 mb-1">Target Completion</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${goal.progress}%` }}
                                            className="h-full bg-gradient-to-r from-goals to-primary shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center">
                                        <Calendar size={14} className="mr-2" />
                                        {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No Deadline'}
                                    </div>
                                    <div className="flex items-center">
                                        <AlertCircle size={14} className="mr-2" />
                                        Active Phase
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {goals.filter(g => g.status === 'active').length === 0 && (
                        <div className="glass rounded-3xl p-16 flex flex-col items-center justify-center text-center opacity-50">
                            <Zap size={48} className="text-slate-700 mb-4" />
                            <h4 className="text-xl font-bold">No High-Intensity Missions</h4>
                            <p className="text-slate-500 mt-2 max-w-xs">Initialize a new mission to begin strategic data tracking.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Analytics */}
                <div className="space-y-6">
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass rounded-[2rem] p-8 border-goals/30"
                        >
                            <h3 className="font-bold text-xl mb-6">Mission Config</h3>
                            <form onSubmit={handleCreateGoal} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter strategic goal..."
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-goals/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                                        <select
                                            value={priority}
                                            onChange={e => setPriority(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-goals/50"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                                        <select
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-goals/50"
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Deadline</label>
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={e => setDeadline(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-goals/50"
                                    />
                                </div>

                                <button className="w-full bg-goals py-4 rounded-xl font-bold shadow-lg shadow-goals/20 hover:shadow-goals/40 transition-all">
                                    Initialize Node
                                </button>
                            </form>
                        </motion.div>
                    )}

                    <div className="glass rounded-[2rem] p-8 space-y-8">
                        <h3 className="font-bold text-lg flex items-center">
                            <Trophy size={18} className="mr-2 text-wealth" />
                            Achievements
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Total Missions</span>
                                <span className="font-bold">{goals.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Completed</span>
                                <span className="font-bold text-goals">{goals.filter(g => g.status === 'completed').length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Overall Progress</span>
                                <span className="font-bold text-primary">
                                    {Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / (goals.length || 1))}%
                                </span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-primary/10 to-goals/10 border border-goals/10 p-5 rounded-2xl">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-goals mb-2">AI Optimization Insight</h4>
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                "System suggests prioritizing your 'Career' missions during the upcoming 48-hour cycle for maximum leverage."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

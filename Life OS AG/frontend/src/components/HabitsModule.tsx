import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, TrendingUp, CheckCircle2, Flame, Award } from 'lucide-react';
import { habitsAPI } from '../api';

export function HabitsModule({ onUpdate }: { onUpdate?: () => void }) {
    const [habits, setHabits] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await habitsAPI.getHabits();
            setHabits(res.data);
        } catch (err) {
            console.error('Failed to fetch habits', err);
        }
    };

    const handleCreateHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await habitsAPI.createHabit({ name, frequency, description });
            setShowForm(false);
            setName('');
            setFrequency('daily');
            setDescription('');
            fetchHabits();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Failed to initialize habit node.');
        }
    };

    const completeHabit = async (id: string) => {
        try {
            await habitsAPI.completeHabit(id);
            fetchHabits();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Completion failed', err);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white">Habit System</h2>
                    <p className="text-slate-400 mt-1">Consistency loops and neural pattern reinforcement.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-habits hover:bg-habits/90 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 shadow-lg shadow-habits/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-bold">New Routine</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-[2rem] p-8 border-habits/30"
                        >
                            <h3 className="font-bold text-xl mb-6">Initialize Neural Loop</h3>
                            <form onSubmit={handleCreateHabit} className="space-y-6">
                                <input
                                    placeholder="Habit Name (e.g. Morning Meditation)"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm focus:border-habits/50 outline-none transition-all"
                                    required
                                />
                                <select
                                    value={frequency}
                                    onChange={e => setFrequency(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-habits/50 appearance-none text-slate-300"
                                >
                                    <option value="daily">Daily Synchronicity</option>
                                    <option value="weekly">Weekly Pulse</option>
                                    <option value="custom">Adaptive Frequency</option>
                                </select>
                                <textarea
                                    placeholder="Description / Context..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm focus:border-habits/50 outline-none h-24 transition-all"
                                />
                                <button className="w-full bg-habits py-4 rounded-xl font-bold shadow-lg shadow-habits/20 hover:shadow-habits/40 transition-all">
                                    Finalize Protocol
                                </button>
                            </form>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {habits.map(habit => (
                            <div key={habit._id} className="glass p-6 rounded-[2rem] card-hover group flex flex-col justify-between h-48">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-habits/10 rounded-xl group-hover:rotate-12 transition-transform">
                                        <Zap className="text-habits" size={20} />
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Flame size={14} className="text-wealth" />
                                        <span className="text-sm font-bold text-white">{habit.streak}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{habit.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{habit.frequency} frequency</p>
                                </div>
                                <button
                                    onClick={() => completeHabit(habit._id)}
                                    className="w-full mt-4 bg-slate-800 hover:bg-habits text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2"
                                >
                                    <CheckCircle2 size={14} />
                                    <span>Sync for Today</span>
                                </button>
                            </div>
                        ))}
                        {habits.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-slate-500 italic">
                                No active neurological rituals detected.
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass rounded-[2rem] p-8">
                        <h3 className="font-bold text-xl mb-6 flex items-center">
                            <Award className="mr-2 text-habits" size={20} />
                            Achievements
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5">
                                <div className="w-10 h-10 rounded-full bg-wealth/20 flex items-center justify-center">
                                    <Flame size={18} className="text-wealth" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase">3 Day Streak</p>
                                    <p className="text-sm text-white font-medium italic">Momentum Building</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-habits/20 to-primary/20 rounded-[2rem] p-8 border border-habits/20">
                        <TrendingUp size={24} className="text-habits mb-4" />
                        <h4 className="font-bold">Neural Plasticity</h4>
                        <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                            Your consistency in the early morning nodes has improved focus efficiency by 18%. System predicts habitual automation in 14 more cycles.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

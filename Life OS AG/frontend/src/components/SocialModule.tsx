import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    MessageSquare,
    Clock,
    UserPlus,
    Heart,
    Star,
    Activity,
    Phone,
    Coffee
} from 'lucide-react';
import { socialAPI } from '../api';

export function SocialModule({ onUpdate }: { onUpdate?: () => void }) {
    const [relationships, setRelationships] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState('Friend');
    const [frequency, setFrequency] = useState('weekly');

    useEffect(() => {
        fetchRelationships();
    }, []);

    const fetchRelationships = async () => {
        try {
            const res = await socialAPI.getRelationships();
            setRelationships(res.data);
        } catch (err) {
            console.error('Failed to fetch relationships', err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await socialAPI.createRelationship({
                name,
                type,
                frequencyGoal: frequency === 'weekly' ? 7 : frequency === 'monthly' ? 30 : 90,
                healthScore: 100
            });
            setShowForm(false);
            setName('');
            setType('Friend'); // Reset type
            setFrequency('weekly'); // Reset frequency
            fetchRelationships();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Failed to connect new human node.');
        }
    };

    const logInteraction = async (id: string, type: string) => {
        try {
            await socialAPI.logInteraction(id, { type, description: `Logged via system dashboard.` });
            fetchRelationships();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Log failed', err);
        }
    };

    const getTimeSince = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">Human CRM</h2>
                    <p className="text-slate-400 mt-1">Social synchronization and relationship health.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-relationships hover:bg-relationships/90 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 shadow-lg shadow-relationships/20 transition-all active:scale-95"
                >
                    <UserPlus size={20} />
                    <span className="font-bold">Add Connection</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 w-fit mb-4">
                        {['All', 'Family', 'Friends', 'Network'].map(tab => (
                            <button key={tab} className={`px-5 py-2 rounded-xl text-xs font-bold ${tab === 'All' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300 transition-colors'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {relationships.map((person) => (
                        <motion.div
                            key={person._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-3xl p-6 border-white/5 flex items-center group hover:border-relationships/30 transition-all"
                        >
                            <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden mr-6 flex-shrink-0">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.name}`} alt={person.name} />
                            </div>

                            <div className="flex-1 min-w-0 mr-6">
                                <div className="flex items-center space-x-2 mb-1">
                                    <h3 className="text-lg font-bold text-white truncate">{person.name}</h3>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
                                        {person.type}
                                    </span>
                                </div>
                                <div className="flex items-center text-xs text-slate-500 space-x-4">
                                    <div className="flex items-center">
                                        <Clock size={12} className="mr-1.5" />
                                        Last: {person.lastInteraction ? getTimeSince(person.lastInteraction) : 'Never'}
                                    </div>
                                    <div className="flex items-center">
                                        <Heart size={12} className="mr-1.5 text-relationships" />
                                        {person.healthScore || 100}% Health
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => logInteraction(person._id, 'Call')} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:bg-relationships hover:text-white transition-all">
                                    <Phone size={18} />
                                </button>
                                <button onClick={() => logInteraction(person._id, 'Meeting')} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:bg-primary hover:text-white transition-all">
                                    <Coffee size={18} />
                                </button>
                                <button onClick={() => logInteraction(person._id, 'Chat')} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:bg-accent hover:text-white transition-all">
                                    <MessageSquare size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {relationships.length === 0 && (
                        <div className="glass rounded-3xl p-16 text-center opacity-50">
                            <Users size={48} className="mx-auto mb-4 text-slate-700" />
                            <h4 className="text-xl font-bold italic">Loneliness detected in current node.</h4>
                            <p className="text-slate-500 mt-2">Initialize a connection to begin synchronizing social health.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass rounded-[2rem] p-8 border-relationships/30"
                        >
                            <h3 className="font-bold text-xl mb-6">New Human Node</h3>
                            <form onSubmit={handleCreate} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Identify human..."
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-relationships/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Class</label>
                                        <select
                                            value={type}
                                            onChange={e => setType(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs outline-none"
                                        >
                                            <option>Friend</option>
                                            <option>Family</option>
                                            <option>Professional</option>
                                            <option>Partner</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Sync Goal</label>
                                        <select
                                            value={frequency}
                                            onChange={e => setFrequency(e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs outline-none"
                                        >
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                        </select>
                                    </div>
                                </div>

                                <button className="w-full bg-relationships py-4 rounded-xl font-bold shadow-lg shadow-relationships/20 transition-all hover:shadow-relationships/40">
                                    Execute Connect
                                </button>
                            </form>
                        </motion.div>
                    )}

                    <div className="glass rounded-[2rem] p-8 space-y-8">
                        <h3 className="font-bold text-lg flex items-center">
                            <Activity size={18} className="mr-2 text-relationships" />
                            Social Index
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 italic">Network Cohesion</span>
                                    <span className="font-bold">92%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="w-[92%] h-full bg-relationships"></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400 italic">Avg Repose Time</span>
                                    <span className="font-bold">12 Days</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="w-[60%] h-full bg-primary"></div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5">
                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center">
                                <Star size={12} className="mr-1.5 text-wealth" />
                                Priority Synchronizations
                            </h4>
                            <ul className="text-xs space-y-2 text-slate-400">
                                {relationships.slice(0, 3).map(r => (
                                    <li key={r._id} className="flex items-center justify-between">
                                        <span>{r.name}</span>
                                        <span className="text-relationships font-bold">Overdue</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Plus,
    Phone,
    MessageCircle,
    Heart,
    Calendar,
    CheckCircle2,
    MessageSquare,
    Trash2
} from 'lucide-react';
import { AddConnectionModal } from './AddConnectionModal';
import { socialAPI, kernelAPI } from '../api';

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
                        stroke="#f43f5e"
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
                    <span className="text-3xl font-display font-bold text-[#0f172a] dark:text-white leading-none">92</span>
                </div>
            </div>
            {label && <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>}
        </div>
    );
};

export function SocialModule({ onUpdate, user, isDarkMode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gratitudeText, setGratitudeText] = useState('');
    const [connections, setConnections] = useState([]);
    const [gratitudeEntries, setGratitudeEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            const res = await socialAPI.getRelationships();
            setConnections(res.data);
        } catch (err) {
            console.error('Failed to fetch connections', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGratitude = async () => {
        try {
            const res = await kernelAPI.getEvents();
            // Filter for gratitude/emotional events
            const entries = res.data.filter((e) => e.type === 'emotional_event' || e.title.includes('Gratitude'));
            setGratitudeEntries(entries);
        } catch (err) {
            console.error('Failed to fetch gratitude', err);
        }
    };

    useEffect(() => {
        fetchConnections();
        fetchGratitude();
    }, [user]);

    const handleGratitudeSubmit = async () => {
        if (!gratitudeText.trim()) return;
        try {
            await kernelAPI.logGenericEvent({
                type: 'emotional_event',
                title: 'Gratitude Entry',
                impact: 'positive',
                value: 5,
                description: gratitudeText
            });
            setGratitudeText('');
            fetchGratitude();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to save gratitude', err);
        }
    };

    const handleDeleteGratitude = async (id) => {
        if (!confirm('Are you sure you want to delete this gratitude entry?')) return;
        try {
            await kernelAPI.deleteEvent(id);
            fetchGratitude();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete gratitude', err);
        }
    };

    const handleDeleteRelationship = async (id) => {
        if (!confirm('Are you sure you want to delete this connection?')) return;
        try {
            await socialAPI.deleteRelationship(id);
            fetchConnections();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete relationship', err);
        }
    };

    const handleInteraction = async (id, name, type) => {
        try {
            await socialAPI.logInteraction(id, {
                type,
                description: `Logged a ${type} with ${name}`
            });
            if (onUpdate) onUpdate();
            fetchConnections(); // Refresh local list too
        } catch (err) {
            console.error('Failed to log interaction', err);
        }
    };

    const socialScore = connections.length > 0 ? Math.min(connections.length * 10, 100) : 0;
    const interactionsThisWeek = gratitudeEntries.filter(e => {
        const entryDate = new Date(e.timestamp || e.createdAt);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= oneWeekAgo;
    }).length;

    const tasks = [];

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center border border-rose-500/20">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Relationships & Social</h1>
                        <p className="text-slate-500 font-medium mt-1">Nurture your connections and social wellbeing</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center space-x-3 transition-all active:scale-95 shadow-lg shadow-rose-500/20"
                >
                    <Plus size={20} />
                    <span>Add Connection</span>
                </button>
            </div>

            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 glass-card p-10 flex flex-col items-center justify-center border-none">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 w-full">Social Connectivity</h3>
                    <CircularProgress value={92} label="Network Strength" />
                </div>

                <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Connections', value: connections.length, icon: Users, trend: '+2 new this month' },
                        { label: 'Meetings This Week', value: interactionsThisWeek, icon: Calendar, trend: '+1 vs last week' },
                        { label: 'Upcoming Events', value: '3', icon: Phone, trend: 'Next: Coffee with Monish' },
                        { label: 'Net Worth Influence', value: '$2.4M', icon: Heart, trend: 'Social capital index' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card p-8 border-none flex flex-col justify-between dark:bg-rose-950/20">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-tight w-2/3">{stat.label}</span>
                                <stat.icon size={20} className="text-white/40" />
                            </div>
                            <div className="mt-8">
                                <p className="text-2xl font-display font-bold text-[#0f172a] dark:text-white leading-none">{stat.value}</p>
                                <p className="text-[10px] font-bold text-rose-400 mt-2 uppercase tracking-widest">{stat.trend}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Your Connections List */}
                <div className="glass-card p-10 border-none">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Recent Interactions</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {connections.length > 0 ? (
                            connections.map((conn) => (
                                <div key={conn._id} className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-white/[0.03] rounded-2xl group transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                            <MessageCircle size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#0f172a] dark:text-white">{conn.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{conn.type} • Today</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleInteraction(conn._id, conn.name, 'call')} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                            <Phone size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteRelationship(conn._id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 opacity-40">
                                <Users size={40} className="mx-auto mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium text-sm">No connections yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Connection Tasks */}
                <div className="glass-card p-10 border-none">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Connection Tasks</h3>
                    {tasks.length > 0 ? (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="flex items-center space-x-4 p-4 bg-slate-100/50 dark:bg-white/[0.03] rounded-2xl group transition-all">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-colors ${task.completed ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-transparent'}`}>
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-[#0f172a] dark:text-white'}`}>{task.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{task.due}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center opacity-40">
                            <CheckCircle2 size={40} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-500 font-medium text-sm">No connection tasks for now.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Gratitude Journal Section */}
            <div className="glass-card p-10 border-rose-50 dark:border-rose-900/10">
                <div className="flex items-center space-x-3 mb-8">
                    <Heart size={24} className="text-[#f43f5e]" />
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Gratitude Journal</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-slate-500 pl-1">What are you grateful for today?</p>
                        <textarea
                            value={gratitudeText}
                            onChange={(e) => setGratitudeText(e.target.value)}
                            placeholder="Type your gratitude entry here..."
                            className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-none rounded-[1.5rem] p-6 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                        />
                        <button
                            onClick={handleGratitudeSubmit}
                            className="bg-[#f43f5e] hover:bg-[#e11d48] text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-rose-100 dark:shadow-none"
                        >
                            Save Entry
                        </button>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Recent Entries</p>
                        {gratitudeEntries.length > 0 ? (
                            <div className="space-y-4">
                                {gratitudeEntries.map((entry) => (
                                    <motion.div
                                        key={entry._id}
                                        whileHover={{ x: 5 }}
                                        className="p-8 glass rounded-[2rem] group relative interactive-hover"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-6">
                                                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                                    <Heart size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-slate-700 dark:text-slate-200 font-medium text-lg leading-relaxed">
                                                        "{entry.description}"
                                                    </p>
                                                    <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">
                                                        Recorded on {new Date(entry.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteGratitude(entry._id)}
                                                className="p-2.5 bg-white/80 dark:bg-slate-900/80 text-red-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 rounded-xl transition-all duration-300 shadow-sm border border-slate-100 dark:border-slate-800"
                                                title="Delete Gratitude Entry"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center opacity-40">
                                <p className="text-slate-500 font-medium text-sm italic">"Gratitude turns what we have into enough."</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddConnectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={async (data) => {
                    await socialAPI.createRelationship(data);
                    fetchConnections();
                    if (onUpdate) onUpdate();
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}

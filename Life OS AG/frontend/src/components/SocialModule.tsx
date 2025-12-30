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

const CircularProgress = ({ value, label }: { value: number; label: string }) => {
    const size = 160;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
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
                        stroke="#f43f5e"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-display font-bold text-[#0f172a] dark:text-white">{value}</span>
                </div>
            </div>
            {label && <p className="mt-4 text-xs font-bold text-slate-400 text-center">{label}</p>}
        </div>
    );
};

export function SocialModule({ onUpdate, user }: { onUpdate?: () => void, user?: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [gratitudeText, setGratitudeText] = useState('');
    const [connections, setConnections] = useState<any[]>([]);
    const [gratitudeEntries, setGratitudeEntries] = useState<any[]>([]);
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
            const entries = res.data.filter((e: any) => e.type === 'emotional_event' || e.title.includes('Gratitude'));
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

    const handleDeleteGratitude = async (id: string) => {
        if (!confirm('Are you sure you want to delete this gratitude entry?')) return;
        try {
            await kernelAPI.deleteEvent(id);
            fetchGratitude();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete gratitude', err);
        }
    };

    const handleDeleteRelationship = async (id: string) => {
        if (!confirm('Are you sure you want to delete this connection?')) return;
        try {
            await socialAPI.deleteRelationship(id);
            fetchConnections();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete relationship', err);
        }
    };

    const handleInteraction = async (id: string, name: string, type: 'call' | 'message') => {
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
    const tasks: any[] = [];

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-2xl bg-[#f43f5e] flex items-center justify-center text-white shadow-lg shadow-rose-100">
                        <Users size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Relationships</h1>
                        <p className="text-slate-500 font-medium mt-1">Nurture your connections and social wellbeing</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#f43f5e] hover:bg-[#e11d48] text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 transition-all shadow-lg shadow-rose-100 dark:shadow-none"
                >
                    <Plus size={20} />
                    <span>Add Connection</span>
                </button>
            </div>

            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start border-rose-50 dark:border-rose-900/10">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-10">Relationship Wellness</h3>
                    <div className="w-full flex justify-center">
                        <CircularProgress value={socialScore} label={connections.length > 0 ? "Building meaningful connections" : "No connections logged"} />
                    </div>
                </div>

                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#fff1f2] dark:bg-rose-500/10 rounded-[2.5rem] p-10 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connections</p>
                            <Users size={20} className="text-[#f43f5e]" />
                        </div>
                        <div className="mt-6">
                            <h4 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white">{connections.length}</h4>
                        </div>
                    </div>

                    <div className="bg-[#fff1f2] dark:bg-rose-500/10 rounded-[2.5rem] p-10 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interactions This Week</p>
                            <MessageSquare size={20} className="text-[#f43f5e]" />
                        </div>
                        <div className="mt-6">
                            <h4 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white">
                                {connections.reduce((s, c) => s + (c.interactionHistory?.length || 0), 0)}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-2">Log interactions to track</p>
                        </div>
                    </div>

                    <div className="bg-[#fff1f2] dark:bg-rose-500/10 rounded-[2.5rem] p-10 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gratitude Entries</p>
                            <Heart size={20} className="text-[#f43f5e]" />
                        </div>
                        <div className="mt-6">
                            <h4 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white">{gratitudeEntries.length}</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-2">Start your journal below</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Your Connections List */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Your Connections</h3>
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Loading...</div>
                    ) : connections.length > 0 ? (
                        <div className="space-y-6">
                            {connections.map((conn) => (
                                <div key={conn._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm">
                                            {conn.avatar || '👤'}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#0f172a] dark:text-white">{conn.name}</h4>
                                            <div className="flex items-center space-x-1 mt-1 text-slate-400">
                                                <Calendar size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">{conn.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleInteraction(conn._id, conn.name, 'call'); }}
                                            className="p-2 text-slate-400 hover:text-[#f43f5e] hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                        >
                                            <Phone size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleInteraction(conn._id, conn.name, 'message'); }}
                                            className="p-2 text-slate-400 hover:text-[#f43f5e] hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                                        >
                                            <MessageCircle size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteRelationship(conn._id); }}
                                            className="p-2 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                                            title="Delete Connection"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <Users size={40} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">Add your inner circle to begin tracking wellness.</p>
                        </div>
                    )}
                </div>

                {/* Connection Tasks */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Connection Tasks</h3>
                    {tasks.length > 0 ? (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="flex items-center space-x-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-colors ${task.completed ? 'bg-[#f43f5e] border-[#f43f5e] text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-transparent group-hover:border-rose-400'}`}>
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`text-sm font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-[#0f172a] dark:text-white font-medium'}`}>{task.title}</h4>
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
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm border-rose-50 dark:border-rose-900/10">
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
                                    <div key={entry._id} className="p-6 bg-rose-50/50 dark:bg-rose-500/5 rounded-2xl group relative">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-[#0f172a] dark:text-white leading-relaxed">{entry.description}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-2">{new Date(entry.timestamp).toLocaleDateString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteGratitude(entry._id)}
                                                className="p-2 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-800"
                                                title="Delete Entry"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
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

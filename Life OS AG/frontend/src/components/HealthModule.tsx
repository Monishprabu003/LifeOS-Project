import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Moon, Sun, Plus, History, TrendingUp, Smile, Dumbbell } from 'lucide-react';
import { healthAPI } from '../api';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export function HealthModule({ onUpdate }: { onUpdate?: () => void }) {
    const [logs, setLogs] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [type, setType] = useState('mood');
    const [value, setValue] = useState(5);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await healthAPI.getLogs();
            setLogs(res.data);
        } catch (err) {
            console.error('Failed to fetch health logs', err);
        }
    };

    const handleLogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const unit = type === 'sleep' ? 'hours' : type === 'exercise' ? 'mins' : '';
            await healthAPI.createLog({ type, value, notes, unit });
            setShowForm(false);
            setNotes('');
            fetchLogs();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Failed to log health data');
        }
    };

    const getChartData = () => {
        return logs
            .filter(l => l.type === 'mood')
            .slice(0, 7)
            .reverse()
            .map(l => ({
                date: new Date(l.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
                value: l.value
            }));
    };

    const logTypes = [
        { id: 'mood', name: 'Mood', icon: Smile, color: 'text-relationships', bg: 'bg-relationships/10', min: 1, max: 10 },
        { id: 'sleep', name: 'Sleep', icon: Moon, color: 'text-primary', bg: 'bg-primary/10', min: 1, max: 12 },
        { id: 'exercise', name: 'Exercise', icon: Dumbbell, color: 'text-habits', bg: 'bg-habits/10', min: 0, max: 300 },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white">Health System</h2>
                    <p className="text-slate-400 mt-1">Physiological and psychological status monitor.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-health hover:bg-health/90 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 shadow-lg shadow-health/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-bold">Log Metric</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Card */}
                <div className="lg:col-span-2 glass rounded-[2rem] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-health/10 rounded-xl">
                                <TrendingUp size={24} className="text-health" />
                            </div>
                            <h3 className="font-bold text-xl">Mood Trajectory</h3>
                        </div>
                        <select className="bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-1 text-xs font-bold text-slate-400 outline-none">
                            <option>Last 7 Days</option>
                            <option>Monthly</option>
                        </select>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getChartData()}>
                                <defs>
                                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis
                                    hide={true}
                                    domain={[0, 10]}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorMood)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Stats Column */}
                <div className="space-y-6">
                    <div className="glass rounded-[2rem] p-6 flex items-center justify-between overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-health/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Sleep</p>
                            <h4 className="text-3xl font-display font-bold mt-1">7.4h</h4>
                        </div>
                        <Activity className="text-health opacity-20" size={48} />
                    </div>

                    <div className="glass rounded-[2rem] p-6 flex items-center justify-between overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Minutes</p>
                            <h4 className="text-3xl font-display font-bold mt-1">142m</h4>
                        </div>
                        <Activity className="text-primary opacity-20" size={48} />
                    </div>

                    <div className="bg-gradient-to-br from-health/20 to-primary/20 rounded-[2rem] p-8 border border-health/20">
                        <h4 className="font-bold flex items-center">
                            <Sun size={18} className="mr-2 text-health" />
                            Vitality Summary
                        </h4>
                        <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                            Your physiological synchronization is balanced. Morning sunlight exposure in the last 2 nodes has improved sleep onset latency by 12%.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Logger Form (Conditional) */}
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-1 glass rounded-[2rem] p-8 border-health/30"
                    >
                        <h3 className="font-bold text-xl mb-6">New Health Log</h3>
                        <form onSubmit={handleLogSubmit} className="space-y-6">
                            <div className="grid grid-cols-3 gap-3">
                                {logTypes.map(l => (
                                    <button
                                        key={l.id}
                                        type="button"
                                        onClick={() => setType(l.id)}
                                        className={`p-4 rounded-2xl flex flex-col items-center transition-all ${type === l.id ? 'bg-health text-white shadow-lg' : 'bg-slate-900/50 hover:bg-slate-800'
                                            }`}
                                    >
                                        <l.icon size={20} />
                                        <span className="text-[10px] font-bold mt-2 uppercase">{l.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Intensity / Value</span>
                                    <span className="text-health">{value}</span>
                                </div>
                                <input
                                    type="range"
                                    min={logTypes.find(t => t.id === type)?.min}
                                    max={logTypes.find(t => t.id === type)?.max}
                                    value={value}
                                    onChange={e => setValue(parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-health"
                                />
                            </div>

                            <textarea
                                placeholder="Log notes (e.g. Dream recall, workout intensity...)"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm focus:border-health/50 outline-none h-24 transition-all"
                            />

                            <button className="w-full bg-health py-4 rounded-xl font-bold shadow-lg shadow-health/20 hover:shadow-health/40 transition-all active:scale-95">
                                Commit to System
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* History List */}
                <div className={`${showForm ? 'lg:col-span-2' : 'lg:col-span-3'} glass rounded-[2rem] p-8`}>
                    <div className="flex items-center space-x-3 mb-8">
                        <History size={20} className="text-slate-500" />
                        <h3 className="font-bold text-xl">Timeline History</h3>
                    </div>

                    <div className="space-y-4">
                        {logs.length === 0 ? (
                            <p className="text-slate-500 italic text-center py-8">No physiological logs recorded in current epoch.</p>
                        ) : (
                            logs.map((log: any) => {
                                const config = logTypes.find(t => t.id === log.type) || logTypes[0]!;
                                const Icon = config.icon;
                                return (
                                    <div key={log._id} className="flex items-center p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                                        <div className={`p-3 ${config.bg} rounded-xl mr-4`}>
                                            <Icon className={config.color} size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold capitalize">{log.type}</h4>
                                            <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right flex items-center space-x-4">
                                            <span className="text-lg font-display font-bold text-white">{log.value} <span className="text-xs text-slate-500 font-normal">{log.unit}</span></span>
                                            {log.notes && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-500 italic max-w-xs truncate">
                                                    "{log.notes}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Heart,
    Wallet,
    Zap,
    Target,
    Users,
    Activity,
    DollarSign,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { healthAPI, financeAPI, habitsAPI, goalsAPI, kernelAPI, socialAPI } from '../api';

interface UnifiedLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function UnifiedLogModal({ isOpen, onClose, onSuccess }: UnifiedLogModalProps) {
    const [activeType, setActiveType] = useState('health');
    const [loading, setLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        title: '',
        value: '',
        category: '',
        notes: '',
        type: 'expense', // for wealth
        impact: 'positive'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (activeType === 'health') {
                const hType = formData.category.toLowerCase() || 'mood';
                await healthAPI.createLog({
                    type: hType,
                    value: parseFloat(formData.value) || 5,
                    notes: formData.notes,
                    unit: hType === 'sleep' ? 'hours' : hType === 'exercise' ? 'mins' : ''
                });
            } else if (activeType === 'wealth') {
                await financeAPI.createTransaction({
                    type: formData.type,
                    amount: parseFloat(formData.value),
                    category: formData.category || 'Other',
                    description: formData.notes
                });
            } else if (activeType === 'generic') {
                await kernelAPI.logGenericEvent({
                    type: 'system_event',
                    title: formData.title,
                    impact: formData.impact as any,
                    value: parseFloat(formData.value) || 0,
                    description: formData.notes
                });
            }

            onSuccess();
            onClose();
            // Reset form
            setFormData({ title: '', value: '', category: '', notes: '', type: 'expense', impact: 'positive' });
        } catch (err) {
            alert('Failed to log event to system kernel.');
        } finally {
            setLoading(false);
        }
    };

    const types = [
        { id: 'health', name: 'Health', icon: Heart, color: 'text-health' },
        { id: 'wealth', name: 'Wealth', icon: Wallet, color: 'text-wealth' },
        { id: 'generic', name: 'System', icon: Zap, color: 'text-accent' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl glass rounded-[2.5rem] p-8 z-[101] border-white/10 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-display font-bold text-white">Kernel Log Entry</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-slate-800 mb-8">
                            {types.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveType(t.id)}
                                    className={`flex-1 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all ${activeType === t.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                        }`}
                                >
                                    <t.icon size={16} className={activeType === t.id ? t.color : ''} />
                                    <span className="text-xs font-bold uppercase">{t.name}</span>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {activeType === 'generic' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Event Name</label>
                                    <input
                                        type="text"
                                        placeholder="Identify life event..."
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm focus:border-accent/50 outline-none transition-all"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                                        {activeType === 'wealth' ? 'Amount' : 'Intensity / Value'}
                                    </label>
                                    <div className="relative">
                                        {activeType === 'wealth' && <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />}
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            required
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                                            className={`w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all ${activeType === 'wealth' ? 'pl-10' : ''}`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all appearance-none text-slate-300"
                                    >
                                        <option value="">Select Category</option>
                                        {activeType === 'health' && (
                                            <>
                                                <option value="mood">Mood</option>
                                                <option value="sleep">Sleep</option>
                                                <option value="exercise">Exercise</option>
                                            </>
                                        )}
                                        {activeType === 'wealth' && (
                                            <>
                                                <option value="Food">Food</option>
                                                <option value="Transport">Transport</option>
                                                <option value="Rent">Rent</option>
                                                <option value="Income">Salary/Income</option>
                                            </>
                                        )}
                                        {activeType === 'generic' && (
                                            <>
                                                <option value="System">System</option>
                                                <option value="Personal">Personal</option>
                                                <option value="Emergency">Emergency</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {activeType === 'wealth' && (
                                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'expense' })}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${formData.type === 'expense' ? 'bg-relationships text-white' : 'text-slate-500'}`}
                                    >
                                        EXPENSE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'income' })}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${formData.type === 'income' ? 'bg-health text-white' : 'text-slate-500'}`}
                                    >
                                        INCOME
                                    </button>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Notes / Description</label>
                                <textarea
                                    placeholder="Record additional context..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm focus:border-primary/50 outline-none transition-all h-24"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? (
                                    <Activity className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} />
                                        <span>Synchronize to Kernel</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

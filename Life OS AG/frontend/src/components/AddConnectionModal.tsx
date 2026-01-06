import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface AddConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export function AddConnectionModal({ isOpen, onClose, onSave }: AddConnectionModalProps) {
    const [name, setName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [frequency, setFrequency] = useState('');

    const handleSave = () => {
        onSave({ name, relationship, frequency });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden p-10"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-display font-bold text-[#0f172a] dark:text-white mb-10">Add New Connection</h2>

                <div className="space-y-8">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Name</label>
                        <input
                            type="text"
                            placeholder="Person's name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border-2 border-[#10b981] rounded-2xl p-4 outline-none text-slate-700 dark:text-slate-200 font-medium"
                        />
                    </div>

                    {/* Relationship Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Relationship</label>
                        <input
                            type="text"
                            placeholder="e.g., Family, Friend, Colleague"
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-slate-700 dark:text-slate-200 outline-none"
                        />
                    </div>

                    {/* Frequency Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Contact Frequency</label>
                        <input
                            type="text"
                            placeholder="e.g., Weekly, Monthly"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-slate-700 dark:text-slate-200 outline-none"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="w-full bg-[#f43f5e] hover:bg-[#e11d48] text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-rose-100 dark:shadow-none transition-all transform hover:-translate-y-0.5"
                    >
                        Add Connection
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

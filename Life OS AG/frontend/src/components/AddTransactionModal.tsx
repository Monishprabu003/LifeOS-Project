import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export function AddTransactionModal({ isOpen, onClose, onSave }: AddTransactionModalProps) {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const categories = [
        { id: 'housing', name: 'Housing' },
        { id: 'food', name: 'Food' },
        { id: 'transport', name: 'Transport' },
        { id: 'entertainment', name: 'Entertainment' },
        { id: 'shopping', name: 'Shopping' },
        { id: 'income', name: 'Salary/Income' },
        { id: 'other', name: 'Other' },
    ];

    const handleSave = () => {
        onSave({
            type,
            amount: parseFloat(amount),
            category,
            description,
            date: new Date()
        });
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

                <h2 className="text-2xl font-display font-bold text-[#0f172a] dark:text-white mb-10">Add Transaction</h2>

                <div className="space-y-8">
                    {/* Type Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Type</label>
                        <div className="relative">
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-white dark:bg-slate-800 border-2 border-[#10b981] rounded-2xl p-4 pr-10 appearance-none outline-none text-slate-700 dark:text-slate-200 font-medium"
                            >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Amount</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {/* Category Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 pr-10 appearance-none outline-none text-slate-700 dark:text-slate-200 font-medium"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        </div>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
                        <input
                            type="text"
                            placeholder="Transaction description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-blue-100 dark:shadow-none transition-all transform hover:-translate-y-0.5"
                    >
                        Save Transaction
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

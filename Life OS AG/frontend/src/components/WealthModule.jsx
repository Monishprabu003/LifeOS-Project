import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet,
    Plus,
    TrendingUp,
    CreditCard,
    PiggyBank,
    IndianRupee,
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Trash2
} from 'lucide-react';
import {
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { AddTransactionModal } from './AddTransactionModal';
import { financeAPI } from '../api';

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
                        stroke="#3b82f6"
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
                    <span className="text-3xl font-display font-bold text-[#0f172a] dark:text-white leading-none">100</span>
                </div>
            </div>
            {label && <p className="mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>}
        </div>
    );
};

export function WealthModule({ onUpdate, user, isDarkMode }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await financeAPI.getTransactions();
            setTransactions(res.data);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await financeAPI.deleteTransaction(id);
            fetchTransactions();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Failed to delete transaction', err);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [user]);

    // Derived stats
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

    // Chart data (mock logic for grouping by category)
    const categoryTotals = transactions.reduce((acc, t) => {
        if (t.type === 'expense') {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
        }
        return acc;
    }, {});

    const expenseBreakdownData = Object.entries(categoryTotals).map(([name, value], index) => ({
        name,
        value,
        color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#94a3b8'][index % 6]
    }));

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center border border-blue-500/20">
                        <Wallet size={28} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Wealth & Finances</h1>
                        <p className="text-slate-500 font-medium mt-1">Track your income, expenses, and savings</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center space-x-3 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} />
                    <span>Add Transaction</span>
                </button>
            </div>

            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 glass-card p-10 flex flex-col items-center justify-center border-none">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 w-full">Financial Health</h3>
                    <CircularProgress value={100} label={`${savingsRate}% savings rate`} />
                </div>

                <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Monthly Income', value: `$${totalIncome.toLocaleString()}`, icon: TrendingUp, trend: '+10% vs last week' },
                        { label: 'Monthly Expenses', value: `$${totalExpense.toLocaleString()}`, icon: CreditCard, trend: '5% vs last week' },
                        { label: 'Savings', value: `$${savings.toLocaleString()}`, icon: PiggyBank, trend: '+15% vs last week' },
                        { label: 'Savings Rate', value: `${savingsRate}%`, icon: IndianRupee, trend: '+8% vs last week' },
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card p-8 border-none flex flex-col justify-between dark:bg-blue-950/20">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-tight w-2/3">{stat.label}</span>
                                <stat.icon size={20} className="text-white/40" />
                            </div>
                            <div className="mt-8">
                                <p className="text-2xl font-display font-bold text-[#0f172a] dark:text-white leading-none">{stat.value}</p>
                                <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${stat.label.includes('Expenses') ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {stat.trend}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Budget Card */}
            <div className="glass-card p-10 border-none">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly Budget</h3>
                    <p className="text-xs font-bold text-slate-400">$3,250 / $4,000</p>
                </div>
                <div className="relative">
                    <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '81%' }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-emerald-500"
                        />
                    </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">81% of budget used - $750 remaining</p>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 glass-card p-10 border-none">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Expense Breakdown</h3>
                    <div className="h-[300px] w-full relative">
                        {expenseBreakdownData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdownData}
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {expenseBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <CreditCard size={40} className="mb-4 text-slate-300" />
                                <p className="text-slate-500 font-medium">Add expense transactions to see breakdown</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7 glass-card p-10 border-none">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Recent Transactions</h3>
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {transactions.map((tx) => (
                            <div key={tx._id} className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-white/[0.03] rounded-2xl group transition-all hover:bg-slate-200/50 dark:hover:bg-white/[0.05]">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        <ArrowUpRight size={18} className={tx.type === 'income' ? '' : 'rotate-90'} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#0f172a] dark:text-white">{tx.description}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{tx.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-[#0f172a] dark:text-white'}`}>
                                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Today</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={async (data) => {
                    await financeAPI.createTransaction(data);
                    fetchTransactions();
                    if (onUpdate) onUpdate();
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}

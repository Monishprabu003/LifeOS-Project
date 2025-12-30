import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Wallet,
    Plus,
    TrendingUp,
    CreditCard,
    PiggyBank,
    DollarSign,
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
                        stroke="#3b82f6"
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

export function WealthModule({ onUpdate, user }: { onUpdate?: () => void, user?: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
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

    const handleDeleteTransaction = async (id: string) => {
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
    const categoryTotals = transactions.reduce((acc: any, t) => {
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
                    <div className="w-16 h-16 rounded-2xl bg-[#3b82f6] flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <Wallet size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Wealth & Finances</h1>
                        <p className="text-slate-500 font-medium mt-1">Track your income, expenses, and savings</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-3 transition-all shadow-lg shadow-blue-100 dark:shadow-none"
                >
                    <Plus size={20} />
                    <span>Add Transaction</span>
                </button>
            </div>

            {/* Top Stat Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-10">Financial Health</h3>
                    <div className="w-full flex justify-center">
                        <CircularProgress value={savingsRate} label={`${savingsRate}% savings rate`} />
                    </div>
                </div>

                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#eff6ff] dark:bg-blue-500/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Income</p>
                            <TrendingUp size={20} className="text-[#3b82f6]" />
                        </div>
                        <div className="mt-6">
                            <h4 className="text-3xl font-display font-bold text-[#0f172a] dark:text-white">${totalIncome.toLocaleString()}</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-2">All time cumulative</p>
                        </div>
                    </div>

                    <div className="bg-[#eff6ff] dark:bg-blue-500/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenses</p>
                            <CreditCard size={20} className="text-[#3b82f6]" />
                        </div>
                        <div className="mt-6">
                            <h4 className="text-3xl font-display font-bold text-[#0f172a] dark:text-white">${totalExpense.toLocaleString()}</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-2">All time cumulative</p>
                        </div>
                    </div>

                    <div className="bg-[#eff6ff] dark:bg-blue-500/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Savings</p>
                            <PiggyBank size={20} className="text-[#3b82f6]" />
                        </div>
                        <div className="mt-6">
                            <h4 className="text-3xl font-display font-bold text-[#0f172a] dark:text-white">${savings.toLocaleString()}</h4>
                            <p className="text-[10px] font-bold text-[#10b981] mt-2">Net growth</p>
                        </div>
                    </div>

                    <div className="bg-[#eff6ff] dark:bg-blue-500/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Savings Rate</p>
                            <DollarSign size={20} className="text-[#3b82f6]" />
                        </div>
                        <div className="mt-6">
                            <h4 className="text-3xl font-display font-bold text-[#0f172a] dark:text-white">{savingsRate}%</h4>
                            <p className="text-[10px] font-bold text-[#10b981] mt-2">Efficiency</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Expense Breakdown</h3>
                    <div className="h-[300px] w-full relative">
                        {expenseBreakdownData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseBreakdownData}
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expenseBreakdownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        iconType="circle"
                                        formatter={(value: string) => <span className="text-[10px] font-bold text-slate-500 uppercase ml-1">{value}</span>}
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

                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-8">Recent Transactions</h3>
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Loading...</div>
                    ) : transactions.length > 0 ? (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200">
                            {transactions.map((tx) => (
                                <div key={tx._id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center space-x-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'income' ? 'bg-[#ecfdf5] text-[#10b981]' : 'bg-[#eff6ff] text-[#3b82f6]'}`}>
                                            {tx.type === 'income' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-[#0f172a] dark:text-white">{tx.description}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <h4 className={`text-sm font-bold ${tx.type === 'income' ? 'text-[#10b981]' : 'text-[#0f172a] dark:text-white'}`}>
                                                {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </h4>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTransaction(tx._id)}
                                            className="p-2 bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all shadow-sm border border-slate-100 dark:border-slate-700"
                                            title="Delete Transaction"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                            <Search size={40} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-400 font-medium text-sm">No transactions yet. Start logging to track your wealth.</p>
                        </div>
                    )}
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

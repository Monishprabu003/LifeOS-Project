import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Plus,
    History,
    DollarSign,
    PieChart as PieChartIcon,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard
} from 'lucide-react';
import { financeAPI } from '../api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export function WealthModule({ onUpdate }: { onUpdate?: () => void }) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const res = await financeAPI.getTransactions();
            setTransactions(res.data);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !category) return;

        try {
            await financeAPI.createTransaction({
                type,
                amount: parseFloat(amount),
                category,
                description,
                date: new Date()
            });
            setShowForm(false);
            setAmount('');
            setCategory('');
            setDescription('');
            fetchTransactions();
            if (onUpdate) onUpdate();
        } catch (err) {
            alert('Failed to log transaction');
        }
    };

    const getChartData = () => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        }).reverse();

        return last7Days.map(day => {
            const dayTransactions = transactions.filter(t =>
                new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }) === day
            );

            return {
                name: day,
                income: dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                expense: dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
            };
        });
    };

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    const categories = {
        expense: ['Food', 'Transport', 'Rent', 'Entertainment', 'Shopping', 'Health', 'Other'],
        income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-display font-bold text-white">Wealth System</h2>
                    <p className="text-slate-400 mt-1">Capital management and resource allocation.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-wealth hover:bg-wealth/90 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 shadow-lg shadow-wealth/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-bold">Log Transaction</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-wealth/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Net Balance</p>
                    <h4 className={`text-4xl font-display font-bold mt-2 ${balance >= 0 ? 'text-white' : 'text-relationships'}`}>
                        ${balance.toLocaleString()}
                    </h4>
                    <div className="flex items-center mt-4 text-xs font-bold">
                        <span className="text-wealth">Capital Liquidity: Stable</span>
                    </div>
                </div>

                <div className="glass rounded-[2rem] p-8 flex items-center justify-between group">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Inflow</p>
                        <h4 className="text-2xl font-display font-bold mt-1 text-health">${totalIncome.toLocaleString()}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-health/10 flex items-center justify-center">
                        <ArrowUpRight className="text-health" />
                    </div>
                </div>

                <div className="glass rounded-[2rem] p-8 flex items-center justify-between group">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Outflow</p>
                        <h4 className="text-2xl font-display font-bold mt-1 text-relationships">${totalExpense.toLocaleString()}</h4>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-relationships/10 flex items-center justify-center">
                        <ArrowDownLeft className="text-relationships" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cashflow Chart */}
                <div className="lg:col-span-2 glass rounded-[2rem] p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-wealth/10 rounded-xl">
                                <PieChartIcon size={24} className="text-wealth" />
                            </div>
                            <h3 className="font-bold text-xl">System Cashflow</h3>
                        </div>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis hide={true} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                />
                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Transaction Form / Side Card */}
                <div className="space-y-6">
                    {showForm ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass rounded-[2rem] p-8 border-wealth/30"
                        >
                            <h3 className="font-bold text-xl mb-6">Log Capital Move</h3>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setType('expense')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${type === 'expense' ? 'bg-relationships text-white' : 'text-slate-500'}`}
                                    >
                                        EXPENSE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('income')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${type === 'income' ? 'bg-health text-white' : 'text-slate-500'}`}
                                    >
                                        INCOME
                                    </button>
                                </div>

                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 focus:border-wealth/50 outline-none transition-all font-display font-bold text-lg"
                                    />
                                </div>

                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-wealth/50 appearance-none text-slate-300"
                                >
                                    <option value="">Select Category</option>
                                    {categories[type].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>

                                <input
                                    type="text"
                                    placeholder="Reference (optional)"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-sm outline-none focus:border-wealth/50 transition-all"
                                />

                                <button className="w-full bg-wealth py-4 rounded-xl font-bold shadow-lg shadow-wealth/20 hover:shadow-wealth/40 transition-all active:scale-95">
                                    Execute Entry
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <div className="glass rounded-[2rem] p-8 border-white/5 space-y-6">
                            <div className="flex items-center space-x-3 text-wealth">
                                <CreditCard size={20} />
                                <h3 className="font-bold">Resource Allocation</h3>
                            </div>
                            <p className="text-sm text-slate-400 italic">
                                "Your burn rate has stabilized. Expense nodes in 'Other' have decreased by 20% this cycle."
                            </p>
                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-500">Savings Rate</span>
                                    <span className="text-health font-bold">24%</span>
                                </div>
                                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="w-[24%] h-full bg-health"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* History List */}
            <div className="glass rounded-[2rem] p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                        <History size={20} className="text-slate-500" />
                        <h3 className="font-bold text-xl">Ledger History</h3>
                    </div>
                    <button className="text-xs font-bold text-wealth uppercase tracking-widest hover:underline">Export Data</button>
                </div>

                <div className="space-y-4">
                    {transactions.slice(0, 10).map((t: any) => (
                        <div key={t._id} className="flex items-center p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                            <div className={`p-3 rounded-xl mr-4 ${t.type === 'income' ? 'bg-health/10' : 'bg-relationships/10'}`}>
                                {t.type === 'income' ? <TrendingUp size={20} className="text-health" /> : <TrendingDown size={20} className="text-relationships" />}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold">{t.description || t.category}</h4>
                                <p className="text-xs text-slate-500">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-lg font-display font-bold ${t.type === 'income' ? 'text-health' : 'text-white'}`}>
                                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                        <p className="text-slate-500 italic text-center py-8">Ledger is empty. Initialize system with capital entry.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

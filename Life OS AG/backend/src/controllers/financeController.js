import Finance from '../models/Finance.js';
import { Kernel } from '../services/Kernel.js';

export const createTransaction = async (req, res) => {
    try {
        const transaction = await Finance.create({
            userId: req.user._id,
            ...req.body,
        });

        // Log a life event
        await Kernel.processEvent(req.user._id, {
            type: 'financial',
            title: `${transaction.type === 'income' ? 'Income' : 'Expense'}: ${transaction.category}`,
            impact: transaction.type === 'income' ? 'positive' : 'negative',
            value: transaction.amount,
            metadata: { transactionId: transaction._id }
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const transactions = await Finance.find({ userId: req.user._id }).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Finance.findById(req.params.id);
        if (!transaction || transaction.userId.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        await Finance.findByIdAndDelete(req.params.id);

        // Recalculate scores
        await Kernel.updateLifeScores(req.user._id);

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

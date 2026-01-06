import express from 'express';
import { createTransaction, getTransactions, deleteTransaction } from '../controllers/financeController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.delete('/:id', deleteTransaction);

export default router;

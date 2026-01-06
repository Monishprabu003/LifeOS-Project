import express from 'express';
import { createHabit, getHabits, completeHabit, deleteHabit } from '../controllers/habitController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect); // All habit routes protected

router.post('/', createHabit);
router.get('/', getHabits);
router.post('/:id/complete', completeHabit);
router.delete('/:id', deleteHabit);

export default router;

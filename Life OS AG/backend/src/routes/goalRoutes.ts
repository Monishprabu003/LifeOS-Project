import express from 'express';
import { createGoal, getGoals, updateGoalProgress, deleteGoal } from '../controllers/goalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', createGoal);
router.get('/', getGoals);
router.patch('/:id/progress', updateGoalProgress);
router.delete('/:id', deleteGoal);

export default router;

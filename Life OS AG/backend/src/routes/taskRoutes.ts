import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createTask, toggleTask, getTasks } from '../controllers/taskController';

const router = express.Router();

router.route('/')
    .get(protect, getTasks)
    .post(protect, createTask);

router.route('/:id/toggle')
    .post(protect, toggleTask);

export default router;

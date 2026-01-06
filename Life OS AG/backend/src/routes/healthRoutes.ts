import express from 'express';
import { createHealthLog, getHealthLogs, deleteHealthLog } from '../controllers/healthController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/', createHealthLog);
router.get('/', getHealthLogs);
router.delete('/:id', deleteHealthLog);

export default router;

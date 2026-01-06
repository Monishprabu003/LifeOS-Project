import express from 'express';
import { getInsight, chatWithAI } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/insight', getInsight);
router.post('/chat', chatWithAI);

export default router;

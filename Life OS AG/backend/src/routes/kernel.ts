import express from 'express';
import { createEvent, getEvents, getLifeStatus, deleteEvent, deleteAllData } from '../controllers/lifeEventController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/event', createEvent);
router.get('/events', getEvents);
router.delete('/events/:id', deleteEvent);
router.delete('/logs', deleteAllData);
router.get('/status', getLifeStatus);

export default router;

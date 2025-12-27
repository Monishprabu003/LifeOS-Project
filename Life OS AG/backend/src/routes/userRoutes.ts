import express from 'express';
import { updateProfile, updateSettings } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);

export default router;

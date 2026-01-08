import express from 'express';
import { updateProfile, updateSettings, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);
router.put('/password', protect, changePassword);

export default router;

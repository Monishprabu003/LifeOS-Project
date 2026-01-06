import { Response } from 'express';
import User from '../models/User';

export const updateProfile = async (req: any, res: Response) => {
    try {
        const { name, bio, avatar } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = name || user.name;
            user.bio = bio || user.bio;
            user.avatar = avatar || user.avatar;

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSettings = async (req: any, res: Response) => {
    try {
        const { theme, notifications } = req.body;
        const user = await User.findById(req.user._id);

        if (user) {
            user.preferences = {
                theme: theme || user.preferences.theme,
                notifications: notifications !== undefined ? notifications : user.preferences.notifications,
            };

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

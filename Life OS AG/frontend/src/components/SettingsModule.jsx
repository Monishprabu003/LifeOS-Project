import { useState } from 'react';
import {
    Settings,
    Bell,
    Lock,
    Trash2,
    Download,
    ChevronRight,
    Shield,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { userAPI } from '../api';

export function SettingsModule() {
    const [notifications, setNotifications] = useState({
        daily: true,
        weekly: true,
        streak: true
    });

    const [passwords, setPasswords] = useState({
        current: '',
        newPassword: ''
    });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (!passwords.current || !passwords.newPassword) {
            setPasswordMessage({ type: 'error', text: 'Please fill in both fields' });
            return;
        }

        setIsUpdatingPassword(true);
        setPasswordMessage({ type: '', text: '' });

        try {
            await userAPI.changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.newPassword
            });
            setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswords({ current: '', newPassword: '' });
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password' });
        } finally {
            setIsUpdatingPassword(false);
            setTimeout(() => setPasswordMessage({ type: '', text: '' }), 5000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
                    <Settings size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your preferences and account</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Notifications Section */}
                <div className="bg-white dark:bg-[#1a1c2e] rounded-[2rem] p-8 border border-slate-100 dark:border-[#222436] shadow-sm">
                    <div className="flex items-center space-x-3 mb-8">
                        <Bell className="text-slate-700 dark:text-slate-300" size={20} />
                        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Notifications</h3>
                    </div>

                    <div className="space-y-6">
                        {[
                            { id: 'daily', title: 'Daily Reminders', desc: 'Get reminded to log your daily data' },
                            { id: 'weekly', title: 'Weekly Review', desc: 'Receive AI insights every Sunday' },
                            { id: 'streak', title: 'Streak Alerts', desc: 'Get notified when streaks are at risk' }
                        ].map((item, idx) => (
                            <div key={item.id} className={`flex items-center justify-between pb-6 ${idx !== 2 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
                                <div>
                                    <h4 className="font-bold text-[#0f172a] dark:text-white">{item.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => toggleNotification(item.id)}
                                    className={`w-14 h-8 rounded-full relative p-1 transition-all duration-300 ${notifications[item.id] ? 'bg-[#10b981]' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <motion.div
                                        animate={{ x: notifications[item.id] ? 24 : 0 }}
                                        className="w-6 h-6 bg-white rounded-full shadow-sm"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white dark:bg-[#1a1c2e] rounded-[2rem] p-8 border border-slate-100 dark:border-[#222436] shadow-sm">
                    <div className="flex items-center space-x-3 mb-8">
                        <Lock className="text-slate-700 dark:text-slate-300" size={20} />
                        <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Security</h3>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#0f172a] dark:text-white">Current Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#0f172a] dark:text-white">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {passwordMessage.text && (
                            <div className={`p-4 rounded-2xl text-sm font-bold ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'}`}>
                                {passwordMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUpdatingPassword}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0f172a] dark:text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isUpdatingPassword ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <span>Update Password</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-[#1a1c2e] rounded-[2rem] p-8 border border-red-100 dark:border-red-900/20 shadow-sm">
                    <div className="flex items-center space-x-3 mb-8">
                        <h3 className="text-lg font-bold text-red-500 tracking-tight">Danger Zone</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-6 border-b border-slate-50 dark:border-slate-800">
                            <div>
                                <h4 className="font-bold text-[#0f172a] dark:text-white text-base">Export Data</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Download all your data as JSON</p>
                            </div>
                            <button className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#0f172a] dark:text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm">
                                Export
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-[#0f172a] dark:text-white text-base">Delete Account</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Permanently delete your account and data</p>
                            </div>
                            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-100 dark:shadow-none">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

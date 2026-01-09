import { useState } from 'react';
import {
    Settings,
    Bell,
    Lock,
    Trash2,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { userAPI } from '../api';

export function SettingsModule() {
    const [settings, setSettings] = useState({
        email: true,
        reminders: true,
        twoStep: false,
        biometric: true
    });

    const [passwords, setPasswords] = useState({
        current: '',
        newPassword: ''
    });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
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
                <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
                    <Settings size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your preferences and account security</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Notifications Section */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-10 shadow-sm transition-all duration-500"
                >
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <Bell size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-[#0f172a] dark:text-white">Notifications</h3>
                    </div>
                    <div className="space-y-6">
                        {[
                            { id: 'email', label: 'Email Notifications', desc: 'Summary of daily performance' },
                            { id: 'reminders', label: 'Push Reminders', desc: 'Habit and goal alerts' }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{item.label}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleToggle(item.id)}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings[item.id] ? 'bg-[#10b981]' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <motion.div
                                        animate={{ x: settings[item.id] ? 24 : 4 }}
                                        className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Security Section */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-10 shadow-sm transition-all duration-500"
                >
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-[#0f172a] dark:text-white">Security</h3>
                    </div>
                    <div className="space-y-6">
                        {[
                            { id: 'twoStep', label: '2-Step Verification', desc: 'Secure your account with MFA' },
                            { id: 'biometric', label: 'Biometric Login', desc: 'Quick access via FaceID/Fingerprint' }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{item.label}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleToggle(item.id)}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings[item.id] ? 'bg-[#10b981]' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <motion.div
                                        animate={{ x: settings[item.id] ? 24 : 4 }}
                                        className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Password Update Form */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-10 shadow-sm transition-all duration-500"
                >
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                            <Lock size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-[#0f172a] dark:text-white">Update Password</h3>
                    </div>

                    <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl px-2">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-[#0f172a] dark:text-white ml-1 font-display">Current Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-[#0f172a] dark:text-white ml-1 font-display">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all font-medium"
                            />
                        </div>

                        {passwordMessage.text && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-2xl text-sm font-bold ${passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-600 dark:bg-red-500/10'}`}
                            >
                                {passwordMessage.text}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isUpdatingPassword}
                            className="bg-[#10b981] text-white px-10 py-4 rounded-2xl text-sm font-bold hover:bg-[#059669] transition-all shadow-lg shadow-emerald-100 dark:shadow-none flex items-center space-x-3 disabled:opacity-50 active:scale-95"
                        >
                            {isUpdatingPassword ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <span>Update Security Key</span>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-10 border-red-100/50 dark:border-red-900/10 shadow-sm transition-all duration-500 bg-red-50/5 dark:bg-red-900/5"
                >
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                            <Trash2 size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-red-500 tracking-tight">Danger Zone</h3>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-white/50 dark:bg-red-900/10 rounded-[2.5rem] border border-red-100 dark:border-red-900/20 backdrop-blur-sm gap-6">
                        <div>
                            <p className="text-lg font-bold text-red-600 dark:text-red-400">Deactivate Account</p>
                            <p className="text-sm text-red-500/70 font-medium mt-1">This will permanently purge all your life data and metrics.</p>
                        </div>
                        <button className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-red-100 dark:shadow-none active:scale-95">
                            Purge All Data
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

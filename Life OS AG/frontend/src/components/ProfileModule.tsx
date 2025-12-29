import { useState } from 'react';
import {
    User,
    Mail,
    Camera,
    Award,
    Award as Trophy,
    Tent,
    PiggyBank,
    Dumbbell,
    Calendar,
    Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export function ProfileModule({ user }: { user: any }) {
    const [xp] = useState(2450);
    const maxXP = 3000;
    const progress = (xp / maxXP) * 100;

    const achievements = [
        {
            id: 1,
            name: 'Early Bird',
            desc: 'Complete morning routine 7 days in a row',
            icon: Tent,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-500/10',
            active: true
        },
        {
            id: 2,
            name: 'Money Saver',
            desc: 'Save 20% of income for 3 months',
            icon: PiggyBank,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            active: true
        },
        {
            id: 3,
            name: 'Habit Master',
            desc: 'Maintain 5 habits for 30 days',
            icon: Trophy,
            color: 'text-slate-400',
            bg: 'bg-slate-50 dark:bg-slate-800',
            active: false
        },
        {
            id: 4,
            name: 'Wellness Warrior',
            desc: 'Achieve 90+ health score for a week',
            icon: Dumbbell,
            color: 'text-slate-400',
            bg: 'bg-slate-50 dark:bg-slate-800',
            active: false
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {/* Page Header */}
            <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-[#0f172a] dark:text-white shadow-sm border border-slate-100 dark:border-slate-700">
                    <User size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-display font-bold text-[#0f172a] dark:text-white leading-tight">Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your profile and view achievements</p>
                </div>
            </div>

            {/* Profile Information Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1a1c2e] rounded-[2.5rem] border border-slate-100 dark:border-[#222436] shadow-sm overflow-hidden"
            >
                {/* Advanced Animated Banner */}
                <div className="h-40 relative overflow-hidden">
                    <motion.div
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%'],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                        className="absolute inset-0 bg-gradient-to-br from-[#10b981] via-[#3b82f6] to-[#8b5cf6] bg-[length:400%_400%]"
                    />
                    {/* Animated Mesh Overlay */}
                    <svg className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay">
                        <filter id="noise">
                            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                        </filter>
                        <rect width="100%" height="100%" filter="url(#noise)" />
                    </svg>
                </div>

                <div className="px-10 pb-10">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-8 gap-6 relative z-10">
                        {/* Avatar */}
                        <div className="relative">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-32 h-32 rounded-full bg-white dark:bg-slate-800 border-4 border-white dark:border-[#1a1c2e] flex items-center justify-center text-4xl font-display font-black text-[#0f172a] dark:text-white shadow-xl"
                            >
                                {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'JD'}
                            </motion.div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute bottom-1 right-1 p-2.5 bg-[#10b981] text-white rounded-xl shadow-lg border-4 border-white dark:border-[#1a1c2e]"
                            >
                                <Camera size={16} />
                            </motion.button>
                        </div>

                        {/* User Metadata */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-3xl font-display font-bold text-[#0f172a] dark:text-white mb-1 truncate">{user?.name || 'John Doe'}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">{user?.email || 'john.doe@example.com'}</p>

                            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
                                <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-900/30">
                                    <Star size={14} className="fill-current" />
                                    <span>Level 12</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 text-slate-500 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                                    <Calendar size={14} />
                                    <span>Joined Dec 2024</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-[#0f172a] dark:text-white uppercase tracking-wider">Experience Points</span>
                            <span className="text-sm font-bold text-slate-500">{xp} / {maxXP} XP</span>
                        </div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-[#10b981] to-[#3b82f6]"
                            />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{maxXP - xp} XP to Level 13</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left: Edit Profile */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-white dark:bg-[#1a1c2e] rounded-[2.5rem] p-8 border border-slate-100 dark:border-[#222436] shadow-sm">
                        <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-8">Edit Profile</h3>

                        <form className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.name?.split(' ')[0] || 'John'}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-[#0f172a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.name?.split(' ')[1] || 'Doe'}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-[#0f172a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                <input
                                    type="email"
                                    defaultValue={user?.email || 'john.doe@example.com'}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-[#0f172a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                                <textarea
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm font-medium text-[#0f172a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all resize-none"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-[#10b981] hover:bg-[#0da271] text-white px-8 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-green-100 dark:shadow-none"
                            >
                                Save Changes
                            </motion.button>
                        </form>
                    </div>
                </div>

                {/* Right: Achievements */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white dark:bg-[#1a1c2e] rounded-[2.5rem] p-8 border border-slate-100 dark:border-[#222436] shadow-sm h-full">
                        <div className="flex items-center space-x-3 mb-8">
                            <Award className="text-amber-500" size={20} />
                            <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">Achievements</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {achievements.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`flex items-center space-x-4 p-5 rounded-3xl border transition-all ${item.active
                                            ? 'bg-amber-50/30 dark:bg-amber-500/10 border-amber-100 dark:border-amber-900/30 ring-1 ring-amber-200/50 dark:ring-amber-900/10 shadow-sm'
                                            : 'bg-slate-50 dark:bg-slate-800/50 border-transparent dark:border-slate-800'}`}
                                    >
                                        <div className={`p-4 rounded-2xl ${item.bg} ${item.color}`}>
                                            <Icon size={24} className={item.active ? 'animate-pulse' : ''} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={`font-bold text-sm ${item.active ? 'text-[#0f172a] dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>{item.name}</h4>
                                            <p className={`text-[10px] sm:text-xs font-medium mt-1 leading-relaxed ${item.active ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400/60 dark:text-slate-700'}`}>{item.desc}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

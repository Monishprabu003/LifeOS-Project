import {
    User,
    Trophy,
    Medal,
    Flame,
    DoorOpen,
    Share2,
    IdCard,
    Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function ProfileModule({ user, totalEvents = 0, habits = [], goals = [] }) {
    // Real Data Calculations
    const baseXP = (totalEvents * 100) + (Math.round(user?.lifeScore || 0) * 10);
    const xp = baseXP;

    const stats = [
        { label: 'Rank', value: '579597', icon: Trophy, color: 'text-amber-500' },
        { label: 'Badges', value: '4', icon: Medal, color: 'text-purple-500' },
        { label: 'Streak', value: '0', icon: Flame, color: 'text-orange-500' },
        { label: 'Completed rooms', value: '16', icon: DoorOpen, color: 'text-blue-500' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
            {/* Main Profile Identity Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f111a] rounded-[2rem] border border-[#222436] p-8 lg:p-12 flex flex-col lg:flex-row items-center lg:items-start gap-12 shadow-2xl"
            >
                {/* Left: Enhanced Avatar */}
                <div className="relative shrink-0">
                    <div className="w-48 h-48 rounded-full border-4 border-slate-700/50 p-2 bg-gradient-to-tr from-[#1a1c2e] to-[#0f111a] shadow-2xl overflow-hidden shadow-blue-900/10">
                        <div className="w-full h-full rounded-full bg-[#1a1c2e] flex items-center justify-center overflow-hidden relative">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-slate-600 flex flex-col items-center">
                                    <div className="bg-slate-700/20 p-4 rounded-full mb-2">
                                        <User size={64} className="text-slate-400" />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">No Image</span>
                                </div>
                            )}
                            {/* Overlay shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Center-Left: Identity & Actions */}
                <div className="flex-1 space-y-8 w-full">
                    <div className="text-center lg:text-left">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-2">
                            <h2 className="text-5xl font-display font-black text-white tracking-tight">
                                {user?.name || 'N1ghtops'}
                            </h2>
                            <div className="flex items-center justify-center lg:justify-start space-x-3 text-slate-500">
                                <span className="font-mono text-xl tracking-tighter">[0x4][SEEKER]</span>
                                <span className="text-2xl" role="img" aria-label="flag">🇮🇳</span>
                            </div>
                        </div>
                        <div className="flex justify-center lg:justify-start space-x-6 text-slate-500 text-sm font-bold tracking-wide mt-4">
                            <span>0 <span className="text-slate-600 ml-1">Following</span></span>
                            <span>0 <span className="text-slate-600 ml-1">Followers</span></span>
                        </div>
                    </div>

                    {/* Action Buttons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#13141f] hover:bg-[#1a1c2e] border border-[#222436] rounded-xl text-sm font-bold text-slate-200 transition-all active:scale-95 group">
                            <span>Add Socials</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#13141f] hover:bg-[#1a1c2e] border border-[#222436] rounded-xl text-sm font-bold text-slate-200 transition-all active:scale-95 group">
                            <span>Add Calendly Link</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#13141f] hover:bg-[#1a1c2e] border border-[#222436] rounded-xl text-sm font-bold text-slate-200 transition-all active:scale-95 group">
                            <Share2 size={16} className="text-slate-400 group-hover:text-blue-400" />
                            <span>Get profile badge ID</span>
                        </button>
                    </div>

                    <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#13141f] hover:bg-[#1a1c2e] border border-[#222436] rounded-xl text-sm font-bold text-slate-200 transition-all active:scale-95 group w-full lg:w-fit">
                        <Share2 size={16} className="text-slate-400 group-hover:text-blue-400" />
                        <span>Share room badges</span>
                    </button>
                </div>

                {/* Right Side: Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-[480px]">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * i }}
                                whileHover={{ scale: 1.02, backgroundColor: '#1a1c2e' }}
                                className="bg-[#13141f] p-6 rounded-2xl border border-[#222436] transition-colors"
                            >
                                <p className="text-[#64748b] text-[10px] font-black uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2.5 rounded-xl bg-slate-800/50 ${stat.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className="text-3xl font-display font-black text-white">{stat.value}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Sub-sections if needed can go here */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 opacity-50 pointer-events-none grayscale">
                {/* Placeholder for future expansion following the same design language */}
                <div className="bg-[#0f111a] rounded-3xl p-8 border border-[#222436] h-64 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                        <Plus className="text-slate-500" />
                    </div>
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs font-display">Expansion Module</span>
                </div>
                <div className="bg-[#0f111a] rounded-3xl p-8 border border-[#222436] h-64 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                        <Plus className="text-slate-500" />
                    </div>
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs font-display">Legacy History</span>
                </div>
            </div>
        </div>
    );
}

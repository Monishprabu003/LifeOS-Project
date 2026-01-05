import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Activity, CheckCircle2, ShoppingCart } from 'lucide-react';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: any[];
}

export function NotificationPanel({ isOpen, onClose, notifications }: NotificationPanelProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-sm"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.95 }}
                        className="fixed top-6 right-6 bottom-6 w-full max-w-md bg-white dark:bg-[#1a1c2e] shadow-2xl rounded-[2.5rem] z-[70] border border-slate-100 dark:border-[#222436] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 dark:border-[#222436] flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <Bell size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">Notifications</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((notif, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={notif._id || index}
                                        className="p-5 bg-slate-50 dark:bg-[#0f111a]/50 rounded-2xl border border-transparent hover:border-blue-500/20 transition-all group"
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${notif.impact === 'positive' ? 'bg-green-500/10 text-green-500' :
                                                notif.impact === 'negative' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {notif.category === 'health' && <Activity size={18} />}
                                                {notif.category === 'wealth' && <ShoppingCart size={18} />}
                                                {notif.category === 'habit' && <CheckCircle2 size={18} />}
                                                {!notif.category && <Activity size={18} />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-[#0f172a] dark:text-white mb-1">{notif.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                    {notif.description || 'System update processed successfully.'}
                                                </p>
                                                <div className="flex items-center space-x-2 mt-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                    <span>{new Date(notif.timestamp || notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    <span>•</span>
                                                    <span className={notif.impact === 'positive' ? 'text-green-500' : notif.impact === 'negative' ? 'text-red-500' : ''}>
                                                        {notif.impact || 'neutral'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                        <Bell size={40} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-medium">No new notifications</p>
                                    <p className="text-xs text-slate-400 mt-2">Check back later for system updates</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-6 border-t border-slate-50 dark:border-[#222436] bg-slate-50/50 dark:bg-[#0f111a]/30">
                                <button className="w-full py-4 text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors">
                                    Mark all as read
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

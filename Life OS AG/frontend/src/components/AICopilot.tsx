import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Bot, Zap } from 'lucide-react';
import { aiAPI } from '../api';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export function AICopilot({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Neural Link Synchronized. System analysis complete. Optimization recommendation: Focus on your Health module today. Your Global Life Score is currently 53%—steady but capable of expansion.",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fixed scrolling logic
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await aiAPI.chat(userMsg.text);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: res.data.response,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch {
            setMessages(prev => [...prev, {
                id: 'err',
                text: "Signal interference detected. Biological systems reporting sub-optimal connection. Please ensure neural link (backend) is active.",
                sender: 'ai',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark Realistic Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#02040A]/80 backdrop-blur-xl z-[65]"
                        onClick={onClose}
                    />

                    {/* Futuristic Chat Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-8 right-8 w-[480px] h-[720px] bg-[#0A0C14] rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_0_2px_rgba(255,255,255,0.1)] z-[70] flex flex-col overflow-hidden border border-white/5"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent backdrop-blur-md">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg relative border border-white/10">
                                        <Zap size={24} fill="white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[22px] tracking-tight text-white leading-none">AI Copilot</h3>
                                    <div className="flex items-center mt-2 space-x-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-400">Neural Link Active</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white"
                            >
                                <X size={24} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
                        >
                            <style>{`
                                .flex-1::-webkit-scrollbar {
                                    width: 4px;
                                }
                                .flex-1::-webkit-scrollbar-track {
                                    background: transparent;
                                }
                                .flex-1::-webkit-scrollbar-thumb {
                                    background: rgba(255, 255, 255, 0.1);
                                    border-radius: 10px;
                                }
                            `}</style>
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl ${msg.sender === 'user' ? 'bg-white/5' : 'bg-blue-500/10'
                                        }`}>
                                        {msg.sender === 'user' ? <User size={18} className="text-white/60" /> : <Bot size={18} className="text-blue-400" />}
                                    </div>
                                    <div className={`relative max-w-[85%] p-6 rounded-[2rem] text-[15px] leading-[1.6] shadow-2xl transition-all ${msg.sender === 'user'
                                        ? 'bg-blue-600 text-white shadow-blue-500/10 border border-white/20'
                                        : 'bg-white/5 border border-white/10 text-white shadow-black/40 backdrop-blur-sm'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-blue-500/10">
                                        <Bot size={18} className="text-blue-400" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-5 px-7 rounded-[2rem] flex space-x-1.5 items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-8 bg-[#0D0F1A] border-t border-white/5">
                            <form onSubmit={handleSend} className="relative">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Command your assistant..."
                                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-5 pl-7 pr-16 focus:border-blue-500/50 outline-none transition-all placeholder:text-white/20 text-white text-[16px] shadow-inner focus:ring-1 focus:ring-blue-500/20"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isTyping}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-blue-400 hover:text-blue-300 disabled:text-white/10 transition-all hover:scale-110 active:scale-90"
                                    >
                                        <Send size={24} strokeWidth={2} fill="currentColor" fillOpacity={0.2} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

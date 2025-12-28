import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, User, Bot } from 'lucide-react';
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
            text: "System initialized. I am your LifeOS Copilot. How can I assist with your life optimization today?",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
        } catch (err) {
            setMessages(prev => [...prev, {
                id: 'err',
                text: "Signal interference detected. Please ensure backend is active.",
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
                    {/* Chat Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed bottom-24 right-8 w-[450px] h-[600px] glass rounded-[2rem] shadow-2xl z-[70] flex flex-col overflow-hidden border border-border/10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border/10 bg-gradient-to-r from-accent/10 to-primary/10 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-display font-bold text-lg">AI Copilot</h3>
                                    <div className="flex items-center space-x-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-health animate-pulse"></span>
                                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted">Neural Link Active</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-surface/50 rounded-full transition-colors text-muted">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
                        >
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center m-1 ${msg.sender === 'user' ? 'ml-3 bg-primary/20 text-primary' : 'mr-3 bg-accent/20 text-accent'
                                            }`}>
                                            {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'glass text-main border border-border/10'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start animate-fade-in">
                                    <div className="bg-accent/10 p-4 rounded-2xl flex space-x-1 items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent/40 animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-6 border-t border-border/10 bg-surface/40">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask your Copilot something..."
                                    className="w-full bg-surface/50 border border-border/50 rounded-xl py-4 pl-5 pr-14 focus:border-accent/50 outline-none transition-all placeholder:text-muted focus:ring-4 focus:ring-accent/5 text-main"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="absolute right-2 top-2 bottom-2 w-10 bg-accent hover:bg-accent/90 disabled:bg-surface disabled:text-muted text-white rounded-lg flex items-center justify-center transition-all shadow-lg shadow-accent/20"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

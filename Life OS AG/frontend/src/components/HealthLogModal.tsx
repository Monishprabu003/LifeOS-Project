import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Smile, Frown, Meh, Laugh } from 'lucide-react';

interface HealthLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        sleepDuration: number;
        sleepQuality: number;
        waterIntake: number;
        stressLevel: number;
        mood: number;
    }) => void;
}

export function HealthLogModal({ isOpen, onClose, onSave }: HealthLogModalProps) {
    const [sleepDuration, setSleepDuration] = useState(7.5);
    const [sleepQuality, setSleepQuality] = useState(8);
    const [waterIntake, setWaterIntake] = useState(2.1);
    const [stressLevel, setStressLevel] = useState(3);
    const [mood, setMood] = useState(3); // 0 to 4

    const emojis = [
        { icon: Frown, label: 'Very Bad' },
        { icon: Frown, label: 'Bad' },
        { icon: Meh, label: 'Neutral' },
        { icon: Smile, label: 'Good' },
        { icon: Laugh, label: 'Great' }
    ];

    const handleSave = () => {
        onSave({
            sleepDuration,
            sleepQuality,
            waterIntake,
            stressLevel,
            mood
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden p-10"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-display font-bold text-[#0f172a] dark:text-white mb-10">Log Health Data</h2>

                <div className="space-y-8">
                    {/* Sleep Duration */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-700 dark:text-slate-300">Sleep Duration: {sleepDuration} hours</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="12"
                            step="0.5"
                            value={sleepDuration}
                            onChange={(e) => setSleepDuration(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                        />
                    </div>

                    {/* Sleep Quality */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-700 dark:text-slate-300">Sleep Quality: {sleepQuality}/10</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={sleepQuality}
                            onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                        />
                    </div>

                    {/* Water Intake */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-700 dark:text-slate-300">Water Intake: {waterIntake}L</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="5"
                            step="0.1"
                            value={waterIntake}
                            onChange={(e) => setWaterIntake(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#10b981]"
                        />
                    </div>

                    {/* Stress Level */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-slate-700 dark:text-slate-300">Stress Level: {stressLevel}/10</span>
                        </div>
                        <div className="relative pt-1">
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="1"
                                value={stressLevel}
                                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                        </div>
                    </div>

                    {/* Mood Section */}
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">How are you feeling?</p>
                        <div className="flex justify-between">
                            {emojis.map((emoji, index) => {
                                const Icon = emoji.icon;
                                const isSelected = mood === index;
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setMood(index)}
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isSelected
                                            ? 'bg-[#ecfdf5] dark:bg-[#10b981]/10 ring-2 ring-[#10b981] text-[#10b981]'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'
                                            }`}
                                    >
                                        <Icon size={24} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        className="w-full bg-[#10b981] hover:bg-[#0da271] text-white font-bold py-5 rounded-[1.5rem] shadow-xl shadow-green-100 dark:shadow-none transition-all transform hover:-translate-y-0.5"
                    >
                        Save Entry
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

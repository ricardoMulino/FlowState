import React, { useState } from 'react';
import { X, Clock, Calendar as CalendarIcon, Tag, AlignLeft, CheckSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Category } from '../../types/calendarTypes';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, duration: number, startTime: Date, tag: string, description: string, isCompleted: boolean, actualDuration?: number) => void;
    categories: Category[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSave, categories }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(60);
    const [actualDuration, setActualDuration] = useState<number | ''>('');
    const [isCompleted, setIsCompleted] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('09:00');
    const [tag, setTag] = useState<string>('work');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        const startTime = new Date(`${date}T${time}`);
        // Only pass actualDuration if it's a number and task is completed
        const finalActualDuration = isCompleted && typeof actualDuration === 'number' ? actualDuration : undefined;

        onSave(title, duration, startTime, tag, description, isCompleted, finalActualDuration);
        onClose();

        // Reset form slightly after close for smooth animation
        setTimeout(() => {
            setTitle('');
            setDescription('');
            setDuration(60);
            setActualDuration('');
            setIsCompleted(false);
            setTag('work');
        }, 300);
    };

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[60]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">New Task</h2>
                                <div className="flex items-center gap-2">
                                    {/* FLO-BOT WIDGET PLACEHOLDER */}
                                    <button
                                        type="button"
                                        className="p-1 px-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 text-xs font-medium border border-purple-500/20"
                                        title="FloBot - AI Assistant (Coming Soon)"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>FloBot</span>
                                    </button>
                                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Task Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="What needs to be done?"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        autoFocus
                                    />
                                </div>

                                {/* Description Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                        <AlignLeft className="w-4 h-4" /> Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add details..."
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Date Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4" /> Date
                                        </label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                                        />
                                    </div>

                                    {/* Time Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Time
                                        </label>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Estimated Duration Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Est. Duration (min)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(Number(e.target.value))}
                                            min={5}
                                            step={5}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>

                                    {/* Tag Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                            <Tag className="w-4 h-4" /> Tag
                                        </label>
                                        <select
                                            value={tag}
                                            onChange={(e) => setTag(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Completed Checkbox */}
                                    <div className="flex items-center gap-3 bg-slate-950/30 p-3 rounded-xl border border-white/5 h-[74px]">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                id="create-task-completed"
                                                checked={isCompleted}
                                                onChange={(e) => setIsCompleted(e.target.checked)}
                                                className="peer w-5 h-5 appearance-none rounded border border-slate-500 checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer"
                                            />
                                            <CheckSquare className="absolute inset-0 w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <label htmlFor="create-task-completed" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                                            Mark as Completed
                                        </label>
                                    </div>

                                    {/* Actual Duration Input */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                                            Actual Duration (min)
                                        </label>
                                        <input
                                            type="number"
                                            value={actualDuration}
                                            onChange={(e) => setActualDuration(e.target.value === '' ? '' : Number(e.target.value))}
                                            min={0}
                                            step={5}
                                            disabled={!isCompleted}
                                            placeholder={!isCompleted ? "Complete task first" : "e.g. 45"}
                                            className={`w-full bg-slate-950/50 border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                                                ${!isCompleted ? 'border-white/5 text-slate-600 cursor-not-allowed placeholder:text-slate-700' : 'border-white/10'}
                                            `}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!title}
                                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Create Task
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

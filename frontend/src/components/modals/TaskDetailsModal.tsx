import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar as CalendarIcon, Tag, AlignLeft, Repeat, Trash2, CheckSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Task } from '../../types/calendarTypes';

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onSave: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string, title: string) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
    isOpen,
    onClose,
    task,
    onSave,
    onDelete
}) => {
    // Local state
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    // Handle date safely
    const safeDate = task.startTime instanceof Date && !isNaN(task.startTime.getTime())
        ? task.startTime
        : new Date();

    const [date, setDate] = useState(safeDate.toISOString().split('T')[0]);
    const [time, setTime] = useState(safeDate.toTimeString().slice(0, 5));
    const [duration, setDuration] = useState(task.duration || 30);
    const [actualDuration, setActualDuration] = useState<number | ''>(task.actualDuration || '');
    const [isCompleted, setIsCompleted] = useState(task.isCompleted || false);
    const [recurrence, setRecurrence] = useState(task.recurrence || 'none');
    const [tagsInput, setTagsInput] = useState((task.tagNames || []).join(', '));

    useEffect(() => {
        if (isOpen) {
            setTitle(task.title);
            setDescription(task.description || '');
            const sDate = task.startTime instanceof Date && !isNaN(task.startTime.getTime())
                ? task.startTime
                : new Date();
            setDate(sDate.toISOString().split('T')[0]);
            setTime(sDate.toTimeString().slice(0, 5));
            setDuration(task.duration || 30);
            setActualDuration(task.actualDuration || '');
            setIsCompleted(task.isCompleted || false);
            setRecurrence(task.recurrence || 'none');
            setTagsInput((task.tagNames || []).join(', '));
        }
    }, [isOpen, task]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const startTime = new Date(`${date}T${time}`);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        const tagNames = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

        // Ensure category is included in tagNames if not present (optional logic)
        // For now, we keep them separate as per backend logic

        const updates: Partial<Task> = {
            title,
            description,
            startTime,
            endTime,
            duration,
            // Only save actualDuration if it's a number and task is completed
            actualDuration: isCompleted && typeof actualDuration === 'number' ? actualDuration : undefined,
            isCompleted,
            recurrence: recurrence === 'none' ? undefined : recurrence,
            tagNames
        };

        onSave(task.id, updates);
        onClose();
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            onDelete(task.id, task.title); // Pass title for legacy delete if needed
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
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
                                <h2 className="text-xl font-bold text-white">Edit Task</h2>
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
                                    <button onClick={handleDelete} className="p-1 text-red-400 hover:text-red-300 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                        <AlignLeft className="w-4 h-4" /> Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24 resize-none"
                                        placeholder="Add details..."
                                    />
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4" /> Date
                                        </label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Time
                                        </label>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                {/* Duration & AI Estimation */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Est. Duration (min)</label>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(Number(e.target.value))}
                                            min={5}
                                            step={5}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> AI Estimation
                                        </label>
                                        <div className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-white">
                                            {task.aiEstimationStatus === 'loading' && (
                                                <span className="text-blue-400 animate-pulse">? Estimating...</span>
                                            )}
                                            {(task.aiEstimationStatus === 'success' && (task.aiRecommendation === 'keep' || task.duration === task.aiTimeEstimation)) && (
                                                <span className="text-green-400 font-medium flex items-center gap-1" title={task.aiReasoning}>
                                                    <CheckSquare className="w-4 h-4" /> Looks good ({task.duration}min)
                                                </span>
                                            )}
                                            {task.aiEstimationStatus === 'success' && task.aiRecommendation === 'increase' && task.duration !== task.aiTimeEstimation && (
                                                <span className="text-yellow-400 font-medium flex items-center gap-1" title={task.aiReasoning}>
                                                    ⚠ Suggest {task.aiTimeEstimation}min
                                                </span>
                                            )}
                                            {task.aiEstimationStatus === 'error' && (
                                                <span className="text-red-400">❌ Error</span>
                                            )}
                                            {!task.aiEstimationStatus && (
                                                <span className="text-slate-500">No AI estimation</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Completed Checkbox */}
                                    <div className="flex items-center gap-3 bg-slate-950/30 p-3 rounded-xl border border-white/5 h-[74px] mt-1">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                id="edit-task-completed"
                                                checked={isCompleted}
                                                onChange={(e) => setIsCompleted(e.target.checked)}
                                                className="peer w-5 h-5 appearance-none rounded border border-slate-500 checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer"
                                            />
                                            <CheckSquare className="absolute inset-0 w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <label htmlFor="edit-task-completed" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                                            Mark as Completed
                                        </label>
                                    </div>

                                    {/* Actual Duration Input */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
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
                                            className={`w-full bg-slate-950/50 border rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50
                                                 ${!isCompleted ? 'border-white/5 text-slate-600 cursor-not-allowed placeholder:text-slate-700' : 'border-white/10'}
                                            `}
                                        />
                                    </div>
                                </div>

                                {/* Recurrence & Tags */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                            <Repeat className="w-4 h-4" /> Recurrence
                                        </label>
                                        <select
                                            value={recurrence}
                                            onChange={(e) => setRecurrence(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                        >
                                            <option value="none">None</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                            <Tag className="w-4 h-4" /> Tags
                                        </label>
                                        <input
                                            type="text"
                                            value={tagsInput}
                                            onChange={(e) => setTagsInput(e.target.value)}
                                            placeholder="e.g. CS1111, Important"
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 mt-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

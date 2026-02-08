import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/calendarTypes';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { GripVertical, MoreHorizontal } from 'lucide-react';

interface SmoothDraggableTaskProps {
    task: Task;
    isOverlay?: boolean;
    onEdit?: (task: Task) => void;
    onUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export const SmoothDraggableTask: React.FC<SmoothDraggableTaskProps> = ({ task, isOverlay, onEdit, onUpdate }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: {
            type: 'task',
            task,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    };

    const height = task.duration * (40 / 30);

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                height: `${height}px`,
                // If overlay, we don't want absolute positioning relative to a parent slot
                position: isOverlay ? 'relative' : 'absolute',
                zIndex: isDragging || isOverlay ? 50 : 10,
            }}
            {...listeners}
            {...attributes}
            className={cn(
                "group rounded-xl p-2 text-xs border cursor-grab active:cursor-grabbing",
                "flex flex-col gap-1 transition-all duration-200",
                "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border-white/10 overflow-hidden",
                isDragging || isOverlay ? "opacity-90 shadow-2xl ring-2 ring-blue-500/50 scale-105 rotate-2" : "opacity-100 hover:bg-white/10 hover:border-white/20",
                !isOverlay && "w-[90%] left-[5%]"
            )}
        >
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundColor: task.color }}
            />

            <div className="relative z-10 flex items-start justify-between min-w-0">
                <span className="font-semibold truncate flex-1 flex items-center gap-1 text-white shadow-black/50 drop-shadow-sm">
                    {isOverlay && <GripVertical className="w-3 h-3 text-white/50" />}
                    {task.title}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                    {/* AI Estimation Status Bubble - Now Clickable */}
                    <div
                        className="absolute -top-2 -right-2 z-20 flex items-center cursor-pointer hover:scale-105 transition-transform"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onEdit) onEdit(task);
                        }}
                    >
                        {task.aiEstimationStatus === 'loading' && (
                            <div
                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.6)] border border-blue-400 animate-pulse scale-110"
                                title="AI Estimating..."
                            >
                                <span className="text-white font-black text-xs">?</span>
                                <span className="text-blue-100 text-[9px] font-bold">AI</span>
                            </div>
                        )}
                        {(task.aiEstimationStatus === 'success' && (task.aiRecommendation === 'keep' || task.duration === task.aiTimeEstimation)) && (
                            <div
                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-600 shadow-[0_0_12px_rgba(22,163,74,0.7)] border border-green-400 scale-110"
                                title={task.aiReasoning || 'AI suggests keeping the estimated time'}
                            >
                                <span className="text-white font-black text-xs">✓</span>
                                <span className="text-green-100 text-[9px] font-bold">{task.duration}m</span>
                            </div>
                        )}
                        {task.aiEstimationStatus === 'success' && task.aiRecommendation === 'increase' && task.duration !== task.aiTimeEstimation && (
                            <div
                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)] border border-yellow-200 scale-125 ring-2 ring-yellow-400/50"
                                title={task.aiReasoning || `AI suggests ${task.aiTimeEstimation}min`}
                            >
                                <span className="text-black font-black text-xs">⚠</span>
                                <span className="text-yellow-900 text-[9px] font-bold">{task.aiTimeEstimation}m</span>
                                {onUpdate && task.aiTimeEstimation && (
                                    <button
                                        className="ml-1 p-0.5 bg-yellow-600/20 hover:bg-yellow-600/40 rounded-full border border-yellow-600/30 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onUpdate && task.aiTimeEstimation) {
                                                onUpdate(task.id, { duration: task.aiTimeEstimation });
                                            }
                                        }}
                                        title="Apply AI Suggestion"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-black/50" />
                                    </button>
                                )}
                            </div>
                        )}
                        {task.aiEstimationStatus === 'error' && (
                            <div
                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.6)] border border-red-400 scale-110"
                                title="AI Estimation Failed"
                            >
                                <span className="text-white font-black text-xs">❌</span>
                            </div>
                        )}
                        {!task.aiEstimationStatus && (
                            <div
                                className="flex items-center px-1.5 py-0.5 rounded-full bg-slate-700/50 border border-slate-500/30"
                                title="No AI estimation"
                            >
                                <span className="text-slate-400 text-[8px]">—</span>
                            </div>
                        )}
                    </div>
                    {!isOverlay && onEdit && (
                        <button
                            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(task);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded shrink-0"
                        >
                            <MoreHorizontal className="w-3 h-3 text-white" />
                        </button>
                    )}
                </div>
            </div>
            <div className="relative z-10 text-white/60 text-[10px] flex justify-between items-end mt-auto">
                <span>{format(task.startTime, 'h:mm a')}</span>
                <span>{task.duration}m</span>
            </div>
        </div>
    );
};

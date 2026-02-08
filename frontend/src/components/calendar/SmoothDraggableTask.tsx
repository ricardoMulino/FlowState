import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
<<<<<<< HEAD
import type { Task } from '../../types/calendar';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { GripVertical } from 'lucide-react';
=======
import type { Task } from '../../types/calendarTypes';
import { cn } from '../../lib/utils';
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1

interface SmoothDraggableTaskProps {
    task: Task;
    isOverlay?: boolean;
}

<<<<<<< HEAD
export const SmoothDraggableTask: React.FC<SmoothDraggableTaskProps> = ({ task, isOverlay }) => {
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
=======
export const SmoothDraggableTask: React.FC<SmoothDraggableTaskProps> = ({
    task,
    isOverlay = false
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useDraggable({
        id: task.id,
        data: {
            task,
            type: 'task'
        },
    });

    // Use CSS transform for GPU-accelerated smooth movement
    const style = {
        transform: CSS.Translate.toString(transform),
        transition: isOverlay ? undefined : transition,
        zIndex: isOverlay ? 9999 : isDragging ? 100 : 1,
    };

    // Calculate height based on duration (60px = 1 hour)
    const height = (task.duration / 60) * 60;
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1

    return (
        <div
            ref={setNodeRef}
<<<<<<< HEAD
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
                "rounded-xl p-2 text-xs border cursor-grab active:cursor-grabbing",
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
                <span className="font-semibold truncate w-full flex items-center gap-1 text-white shadow-black/50 drop-shadow-sm">
                    {isOverlay && <GripVertical className="w-3 h-3 text-white/50" />}
                    {task.title}
                </span>
            </div>
            <div className="relative z-10 text-white/60 text-[10px] flex justify-between items-end mt-auto">
                <span>{format(task.startTime, 'h:mm a')}</span>
                <span>{task.duration}m</span>
            </div>
        </div>
    );
};
=======
            style={style}
            className={cn(
                "absolute w-[90%] left-[5%] rounded-lg p-2 cursor-grab select-none",
                "shadow-sm border border-white/20",
                "transition-shadow duration-150",
                isDragging && "opacity-40 cursor-grabbing shadow-lg",
                isOverlay && "opacity-95 cursor-grabbing shadow-2xl rotate-1 scale-105 ring-2 ring-white/50",
                "backdrop-blur-md"
            )}
            {...listeners}
            {...attributes}
        >
            {/* Task content */}
            <div
                className="h-full rounded-md p-2"
                style={{ backgroundColor: `${task.color}90` }}
            >
                <div className="text-xs font-semibold text-white truncate drop-shadow-md">
                    {task.title}
                </div>
                <div className="text-[10px] text-white/80 font-medium">
                    {formatTime(task.startTime)} - {task.duration}min
                </div>
            </div>

            {/* Resize handle at bottom */}
            {!isOverlay && (
                <div
                    className="absolute bottom-0 left-2 right-2 h-2 cursor-ns-resize 
                     hover:bg-white/30 rounded-full transition-colors"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        // TODO: Implement resize
                    }}
                />
            )}
        </div>
    );
};

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1

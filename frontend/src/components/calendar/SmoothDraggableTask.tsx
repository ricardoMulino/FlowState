import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/calendar';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { GripVertical } from 'lucide-react';

interface SmoothDraggableTaskProps {
    task: Task;
    isOverlay?: boolean;
}

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

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/calendar';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

interface DraggableTaskProps {
    task: Task;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { task },
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
                position: 'absolute', // Ensures correct positioning logic in parent
                zIndex: isDragging ? 50 : 10,
            }}
            {...listeners}
            {...attributes}
            className={cn(
                "w-[90%] left-[5%] rounded-lg p-2 text-xs border cursor-grab active:cursor-grabbing",
                "flex flex-col gap-1 shadow-lg transition-all",
                isDragging ? "opacity-80 ring-2 ring-white/50 z-50" : "opacity-100 hover:scale-[1.02]",
                "bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md border-white/20 overflow-hidden"
            )}
        >
            <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundColor: task.color }}
            />

            <div className="relative z-10 flex items-start justify-between min-w-0">
                <span className="font-semibold truncate w-full shadow-black/50 drop-shadow-sm">{task.title}</span>
            </div>
            <div className="relative z-10 text-white/60 text-[10px]">
                {format(task.startTime, 'h:mm a')}
            </div>

            {/* Resize Handle */}
            <div
                className="resize-handle absolute bottom-0 left-0 w-full h-3 cursor-ns-resize flex justify-center items-center hover:bg-white/20 transition-colors z-20 group"
                data-resize-handle="true"
            >
                <div className="w-8 h-1 bg-white/30 rounded-full group-hover:bg-white/50" />
            </div>
        </div>
    );
};

export default DraggableTask;

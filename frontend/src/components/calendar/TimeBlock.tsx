import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../lib/utils';
import type { CategoryId } from '../../types/calendarTypes';
import { format } from 'date-fns';

interface TimeBlockProps {
    day: Date;
    hour: number;
    minute: number;
    category: CategoryId;
}

const TimeBlock: React.FC<TimeBlockProps> = ({ day, hour, minute, category }) => {
    // Unique ID for the drop zone
    const id = `${day.toISOString()}|${category}|${hour}|${minute}`;
    // console.log('TimeBlock render', id); 

    // Construct the specific date time for this block
    const blockDate = new Date(day);
    blockDate.setHours(hour, minute, 0, 0);

    const { isOver, setNodeRef } = useDroppable({
        id,
        data: {
            type: 'calendar-cell',
            date: blockDate,
            category
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "h-[40px] w-full border-b border-white/5 transition-colors relative group",
                isOver && "bg-white/10"
            )}
        >
            {/* Optional: Show time label on hover or if it's the start of an hour */}
            {minute === 0 && (
                <span className="absolute left-1 top-1 text-[10px] text-slate-600 group-hover:text-slate-400 select-none">
                    {format(new Date().setHours(hour, minute), 'h a')}
                </span>
            )}
        </div>
    );
};

export default TimeBlock;
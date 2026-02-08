import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../lib/utils';
import type { CategoryId } from '../../types/calendar';

interface SnapGridProps {
    date: Date;
    category: CategoryId;
    children: React.ReactNode;
}

export const SnapGrid: React.FC<SnapGridProps> = ({
    date,
    category,
    children
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `cell-${date.toISOString()}-${category}`,
        data: {
            type: 'calendar-cell',
            date,
            category
        },
    });

    // Generate snap lines for visual feedback
    const snapLines = Array.from({ length: 34 }, (_, i) => i);

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "relative h-[720px] w-full",
                "transition-colors duration-200",
                "bg-slate-950/20", // Default background to ensure drop zone is visible/interactive
                isOver && "bg-white/10"
            )}
        >
            {/* Snap grid lines */}
            <div className="absolute inset-0 pointer-events-none">
                {snapLines.map((i) => (
                    <div
                        key={i}
                        className={cn(
                            "absolute w-full border-b",
                            i % 2 === 0
                                ? "border-white/5"
                                : "border-dashed border-white/[0.02]"
                        )}
                        style={{ top: `${i * 15}px` }}
                    />
                ))}
            </div>

            {/* Hover indicator */}
            {isOver && (
                <div className="absolute inset-0 bg-blue-500/10 pointer-events-none 
                        animate-pulse rounded-lg" />
            )}

            {children}
        </div>
    );
};
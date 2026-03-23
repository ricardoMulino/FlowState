import React from 'react';
import type { Task, CategoryId } from '../../types/calendarTypes';
import { SmoothDraggableTask } from './SmoothDraggableTask';
import { SnapGrid } from './SnapGrid';

interface DayCellProps {
    day: Date;
    category?: CategoryId; // Optional now, or defaults to specific logic
    tasks: Task[];
    onEdit?: (task: Task) => void;
    onUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export const DayCell: React.FC<DayCellProps> = ({
    day,
    category = 'work',
    tasks,
    onEdit,
    onUpdate
}) => {
    // Build boundary dates once — never mutate the `day` prop inline
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    return (
        <SnapGrid date={day} category={category}>
            <div className="relative h-full">
                {tasks.map((task) => {
                    // Fallback endTime in case task.endTime is missing
                    const endTime = task.endTime instanceof Date && !isNaN(task.endTime.getTime())
                        ? task.endTime
                        : new Date(task.startTime.getTime() + task.duration * 60000);

                    const effectiveStart = dateMax(task.startTime, dayStart);
                    const effectiveEnd = dateMin(endTime, dayEnd);

                    const top = getYPosition(effectiveStart);
                    const height = getYPosition(effectiveEnd) - top;

                    return (
                        <div
                            key={task.id}
                            className="absolute w-full overflow-hidden"
                            style={{ top: `${top}px`, height: `${height}px` }}
                        >
                            <SmoothDraggableTask task={task} onEdit={onEdit} onUpdate={onUpdate} />
                        </div>
                    );
                })}
            </div>
        </SnapGrid>
    );
};

function getYPosition(date: Date): number {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return (hour + minute / 60) * 60;
}

function dateMax(date1: Date, date2: Date): Date {
    return date1 > date2 ? date1 : date2;
}

function dateMin(date1: Date, date2: Date): Date {
    return date1 < date2 ? date1 : date2;
}
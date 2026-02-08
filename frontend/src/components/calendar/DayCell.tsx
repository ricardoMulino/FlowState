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
    category = 'work', // Default fallback if needed, or handle as generic
    tasks,
    onEdit,
    onUpdate
}) => {
    return (
        <SnapGrid date={day} category={category}>
            <div className="relative h-full">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="absolute w-full"
                        style={{
                            top: `${getYPosition(task.startTime)}px`,
                        }}
                    >
                        <SmoothDraggableTask task={task} onEdit={onEdit} onUpdate={onUpdate} />
                    </div>
                ))}
            </div>
        </SnapGrid>
    );
};

function getYPosition(date: Date): number {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return (hour + minute / 60) * 60;
}
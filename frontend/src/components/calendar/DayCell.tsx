import React from 'react';
import type { Task, CategoryId } from '../../types/calendarTypes';
import { SmoothDraggableTask } from './SmoothDraggableTask';
import { SnapGrid } from './SnapGrid';

interface DayCellProps {
    date: Date;
    category: CategoryId;
    tasks: Task[];
    color: string;
}

export const DayCell: React.FC<DayCellProps> = ({
    date,
    category,
    tasks,
    color
}) => {
    return (
        <SnapGrid date={date} category={category}>
            <div className="relative h-full">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="absolute w-full"
                        style={{
                            top: `${getYPosition(task.startTime)}px`,
                        }}
                    >
                        <SmoothDraggableTask task={task} />
                    </div>
                ))}
            </div>
        </SnapGrid>
    );
};

function getYPosition(date: Date): number {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return ((hour - 6) + minute / 60) * 60;
}
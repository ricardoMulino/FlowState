import { useSensor, useSensors, PointerSensor, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import type { Task, CategoryId } from '../types/calendar';

export function useDragAndDrop(
    moveTask: (id: string, newStartTime: Date, newCategory?: CategoryId) => void
) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [resizeTaskState, setResizeTaskState] = useState<{ id: string; duration: number } | null>(null);
    const [isResizing, setIsResizing] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = (active.data.current as any)?.task as Task;

        // Check if resize handle was clicked
        const target = (event.activatorEvent as Event)?.target as HTMLElement;
        const isResizeHandle = target?.closest?.('.resize-handle') || target?.getAttribute('data-resize-handle');

        if (isResizeHandle) {
            setIsResizing(true);
            if (task) {
                setResizeTaskState({ id: task.id, duration: task.duration });
            }
        } else {
            setIsResizing(false);
        }

        setActiveId(active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent, resizeTaskFn?: (id: string, duration: number) => void) => {
        const { delta } = event;

        if (isResizing && resizeTaskFn && resizeTaskState) {
            const minutesDelta = delta.y * (30 / 40);
            const snappedDelta = Math.round(minutesDelta / 30) * 30;
            const newDuration = Math.max(30, resizeTaskState.duration + snappedDelta);

            resizeTaskFn(resizeTaskState.id, newDuration);
        } else if (event.over && !isResizing) {
            const parts = (event.over.id as string).split('|');
            if (parts.length === 4) {
                const [dayStr, category, hourStr, minuteStr] = parts;
                const hour = parseInt(hourStr);
                const minute = parseInt(minuteStr);

                const newDate = new Date(dayStr);
                newDate.setHours(hour);
                newDate.setMinutes(minute);

                moveTask(event.active.id as string, newDate, category as CategoryId);
            }
        }

        setActiveId(null);
        setIsResizing(false);
        setResizeTaskState(null);
    };

    return {
        sensors,
        activeId,
        handleDragStart,
        handleDragEnd,
    };
}

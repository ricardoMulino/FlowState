import { useState, useCallback } from 'react';
import {
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    PointerSensor,
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import type { Task } from '../types/calendar';
import type { TaskTemplate } from '../data/templates';

interface UseDragAndDropProps {
    tasks: Task[];
    onTaskMove: (taskId: string, newStartTime: Date, newCategory: string) => void;
    onTaskCreate?: (template: TaskTemplate, startTime: Date, category: string) => void;
}

export function useDragAndDrop({ tasks, onTaskMove, onTaskCreate }: UseDragAndDropProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeTemplate, setActiveTemplate] = useState<TaskTemplate | null>(null);

    // Use mouse sensor with distance constraint to prevent accidental drags
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 5, // Must move 5px before drag starts
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // Touch and hold for 250ms
                tolerance: 5,
            },
        }),
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const data = active.data.current as { type?: string; task?: Task; template?: TaskTemplate };

        if (data?.type === 'template' && data.template) {
            setActiveId(active.id as string);
            setActiveTemplate(data.template);
        } else {
            const taskId = active.id as string;
            const task = tasks.find(t => t.id === taskId);

            if (task) {
                setActiveId(taskId);
                setActiveTask(task);
            }
        }
    }, [tasks]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over, delta } = event;

        if (!over) {
            setActiveId(null);
            setActiveTask(null);
            setActiveTemplate(null);
            return;
        }

        const overData = over.data.current as {
            type: string;
            date?: Date;
            category?: string
        } | undefined;

        if (overData?.type === 'calendar-cell' && overData.date) {
            // Handle template drop (create new task)
            if (activeTemplate && onTaskCreate) {
                // Calculate time based on drop position
                const pixelsPerMinute = 60 / 60; // hourHeight / 60 minutes
                const minutesDelta = Math.round((delta.y * pixelsPerMinute) / 30) * 30; // Snap to 30min

                const newStartTime = new Date(overData.date);
                const newMinutes = Math.max(6 * 60, Math.min(23 * 60, 6 * 60 + minutesDelta)); // Default 6am + delta, clamp 6am-11pm

                newStartTime.setHours(Math.floor(newMinutes / 60));
                newStartTime.setMinutes(newMinutes % 60);

                onTaskCreate(activeTemplate, newStartTime, overData.category || activeTemplate.category);
            }
            // Handle existing task move
            else if (activeTask) {
                // Calculate new time based on drag delta
                const pixelsPerMinute = 60 / 60; // hourHeight / 60 minutes
                const minutesDelta = Math.round((delta.y * pixelsPerMinute) / 30) * 30; // Snap to 30min

                const newStartTime = new Date(overData.date);
                const currentMinutes = activeTask.startTime.getHours() * 60 + activeTask.startTime.getMinutes();
                const newMinutes = Math.max(6 * 60, Math.min(23 * 60, currentMinutes + minutesDelta)); // Clamp 6am-11pm

                newStartTime.setHours(Math.floor(newMinutes / 60));
                newStartTime.setMinutes(newMinutes % 60);

                onTaskMove(
                    active.id as string,
                    newStartTime,
                    overData.category || activeTask.category
                );
            }
        }

        setActiveId(null);
        setActiveTask(null);
        setActiveTemplate(null);
    }, [activeTask, activeTemplate, onTaskMove, onTaskCreate]);

    return {
        sensors,
        activeId,
        activeTask,
        activeTemplate,
        handleDragStart,
        handleDragEnd,
    };
}

<<<<<<< HEAD
import { useState, useCallback } from 'react';
import {
=======
<<<<<<< HEAD
import { useState, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
<<<<<<< HEAD
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
=======
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import type { Task } from '../types/calendarTypes';
import type { TaskTemplate } from '../data/templates';

interface UseDragAndDropProps {
    tasks: Task[];
    onTaskMove: (taskId: string, newStartTime: Date, newCategory: string) => void;
    onTaskCreate?: (template: TaskTemplate, startTime: Date, category: string) => void;
}

export function useDragAndDrop({ tasks, onTaskMove, onTaskCreate }: UseDragAndDropProps) {
=======
import { useSensor, useSensors, PointerSensor, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';
import type { Task, CategoryId } from '../types/calendar';

export function useDragAndDrop(
    moveTask: (id: string, newStartTime: Date, newCategory?: CategoryId) => void
) {
>>>>>>> abeb5dfc8d77bb1c827f249bf92a96dfb9e7dad3
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
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
<<<<<<< HEAD

            if (task) {
                setActiveId(taskId);
                setActiveTask(task);
            }
        }
    }, [tasks]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

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
                // For templates, we simply snap to the dropped slot's time
                // The TimeBlock now provides the exact start time in overData.date
                onTaskCreate(activeTemplate, overData.date, overData.category || activeTemplate.category);
            }
            // Handle existing task move
            else if (activeTask) {
                // For existing tasks, it's also safer to snap to the target slot
                // We can use the delta if we want sub-slot precision, but snapping to grid is better UX for this view
                onTaskMove(
                    active.id as string,
                    overData.date,
                    overData.category || activeTask.category
                );
=======

            if (task) {
                setActiveId(taskId);
                setActiveTask(task);
            }
        }
    }, [tasks]);

<<<<<<< HEAD
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over, delta } = event;
=======
        setActiveId(active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent, resizeTaskFn?: (id: string, duration: number) => void) => {
        const { delta } = event;
>>>>>>> abeb5dfc8d77bb1c827f249bf92a96dfb9e7dad3

        if (!over) {
            setActiveId(null);
            setActiveTask(null);
            setActiveTemplate(null);
            return;
        }

<<<<<<< HEAD
        const overData = over.data.current as {
            type: string;
            date?: Date;
            category?: string
        } | undefined;
=======
            resizeTaskFn(resizeTaskState.id, newDuration);
        } else if (event.over && !isResizing) {
            const parts = (event.over.id as string).split('|');
            if (parts.length === 4) {
                const [dayStr, category, hourStr, minuteStr] = parts;
                const hour = parseInt(hourStr);
                const minute = parseInt(minuteStr);
>>>>>>> abeb5dfc8d77bb1c827f249bf92a96dfb9e7dad3

        if (overData?.type === 'calendar-cell' && overData.date) {
            // Handle template drop (create new task)
            if (activeTemplate && onTaskCreate) {
                // Calculate time based on drop position
                const pixelsPerMinute = 60 / 60; // hourHeight / 60 minutes
                const minutesDelta = Math.round((delta.y * pixelsPerMinute) / 30) * 30; // Snap to 30min

<<<<<<< HEAD
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
=======
                moveTask(event.active.id as string, newDate, category as CategoryId);
>>>>>>> abeb5dfc8d77bb1c827f249bf92a96dfb9e7dad3
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
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

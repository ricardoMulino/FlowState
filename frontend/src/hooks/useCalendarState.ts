import { useState, useCallback } from 'react';
import type { Task, CategoryId } from '../types/calendarTypes';
import { MOCK_TASKS } from '../data/mock-tasks';
import { addMinutes, isSameDay } from 'date-fns';

export function useCalendarState() {
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

    const addTask = useCallback((task: Task) => {
        setTasks((prev) => [...prev, task]);
    }, []);

    const updateTask = useCallback((id: string, updates: Partial<Task>) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    }, []);

    const moveTask = useCallback((id: string, newStartTime: Date, newCategory?: CategoryId) => {
        setTasks((prev) => prev.map((t) => {
            if (t.id !== id) return t;

            const duration = t.duration;
            const endTime = addMinutes(newStartTime, duration);

            return {
                ...t,
                startTime: newStartTime,
                endTime,
                category: newCategory || t.category,
            };
        }));
    }, []);

    const resizeTask = useCallback((id: string, newDuration: number) => {
        setTasks((prev) => prev.map((t) => {
            if (t.id !== id) return t;

            const endTime = addMinutes(t.startTime, newDuration);

            return {
                ...t,
                duration: newDuration,
                endTime,
                estimatedTime: newDuration,
            };
        }));
    }, []);

    const getTasksForDayAndCategory = useCallback((date: Date, categoryId: CategoryId) => {
        return tasks.filter((t) =>
            t.category === categoryId && isSameDay(t.startTime, date)
        );
    }, [tasks]);

    return {
        tasks,
        addTask,
        updateTask,
        moveTask,
        resizeTask,
        getTasksForDayAndCategory,
    };
}

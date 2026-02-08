import { useState, useCallback, useEffect } from 'react';
import type { Task } from '../types/calendarTypes';
import { addMinutes, isSameDay } from 'date-fns';
import { taskAPI } from '../api/flowstate';

export function useCalendarState(userEmail: string | null) {
    const [tasks, setTasks] = useState<Task[]>([]);

    const fetchTasks = useCallback(async () => {
        if (!userEmail) return;
        try {
            const fetchedTasks = await taskAPI.getAllForUser(userEmail);
            // Transform API tasks to frontend Task format
            const formattedTasks: Task[] = fetchedTasks.map((t: any) => ({
                id: t._id || t.id,
                taskClientId: t.task_client_id, // Preserve for WebSocket matching
                title: t.title,
                description: t.description,
                startTime: t.start_time ? new Date(t.start_time) : new Date(), // Fallback
                endTime: t.end_time ? new Date(t.end_time) : addMinutes(new Date(), 30),
                duration: t.duration || 30,
                color: t.color || '#3b82f6',
                isCompleted: t.is_completed || false,
                estimatedTime: t.estimatedTime || 30,
                recurrence: t.recurrence,
                tagNames: t.tag_names || [],
                aiEstimationStatus: t.ai_estimation_status,
                aiTimeEstimation: t.ai_time_estimation,
                aiRecommendation: t.ai_recommendation,
                aiReasoning: t.ai_reasoning,
                aiConfidence: t.ai_confidence
            }));
            setTasks(formattedTasks);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    }, [userEmail]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = useCallback(async (task: Task, socketId?: string) => {
        if (!userEmail) return;
        // Optimistic update
        setTasks((prev) => [...prev, task]);
        try {
            await taskAPI.create(
                userEmail,
                task.title,
                task.description,
                task.tagNames || [],
                task.startTime,
                // task.endTime removed from API call
                task.recurrence,
                task.color,
                task.id, // Pass task_client_id
                socketId, // Pass socket_id
                task.aiEstimationStatus
            );
            // Refresh to get ID (though WebSocket might beat it)
            fetchTasks();
        } catch (e) {
            console.error("Failed to add task", e);
        }
    }, [fetchTasks, userEmail]);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
        try {
            const backendUpdates: any = { ...updates };
            // Map frontend keys to backend keys
            if (updates.startTime) backendUpdates.start_time = updates.startTime.toISOString();
            // if (updates.endTime) backendUpdates.end_time = updates.endTime.toISOString(); // Removed
            if (updates.tagNames) backendUpdates.tag_names = updates.tagNames;
            if (updates.isCompleted !== undefined) backendUpdates.is_completed = updates.isCompleted;
            if (updates.color) backendUpdates.color = updates.color;
            if (updates.aiEstimationStatus) backendUpdates.ai_estimation_status = updates.aiEstimationStatus;
            if (updates.aiTimeEstimation) backendUpdates.ai_time_estimation = updates.aiTimeEstimation;
            if (updates.aiRecommendation) backendUpdates.ai_recommendation = updates.aiRecommendation;
            if (updates.aiReasoning) backendUpdates.ai_reasoning = updates.aiReasoning;
            if (updates.aiConfidence) backendUpdates.ai_confidence = updates.aiConfidence;

            await taskAPI.update(id, backendUpdates);
        } catch (e) {
            console.error("Failed to update task", e);
        }
    }, []);

    const moveTask = useCallback((id: string, newStartTime: Date, newTag?: string) => {
        setTasks((prev) => prev.map((t) => {
            if (t.id !== id) return t;

            const duration = t.duration;
            const endTime = addMinutes(newStartTime, duration);

            // Trigger API update
            const newTagNames = newTag ? [newTag] : t.tagNames;
            const updates: Partial<Task> = {
                startTime: newStartTime,
                endTime,
                tagNames: newTagNames
            };

            // We call the API asynchronously but update state immediately
            taskAPI.update(id, {
                start_time: newStartTime.toISOString(),
                // end_time: endTime.toISOString(), // Removed
                tag_names: newTagNames
            }).catch(console.error);

            return {
                ...t,
                ...updates
            };
        }));
    }, []);

    const resizeTask = useCallback((id: string, newDuration: number) => {
        setTasks((prev) => prev.map((t) => {
            if (t.id !== id) return t;

            const endTime = addMinutes(t.startTime, newDuration);

            // Trigger API update
            taskAPI.update(id, {
                duration: newDuration
            }).catch(console.error);

            return {
                ...t,
                duration: newDuration,
                endTime,
                estimatedTime: newDuration,
            };
        }));
    }, []);

    const deleteTask = useCallback(async (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        try {
            await taskAPI.deleteById(id);
        } catch (e) {
            console.error("Failed to delete task", e);
            // Optionally revert state here if needed
        }
    }, []);

    const getTasksForDayAndTag = useCallback((date: Date, tagId: string) => {
        return tasks.filter((t) =>
            t.tagNames?.includes(tagId) && isSameDay(t.startTime, date)
        );
    }, [tasks]);

    return {
        tasks,
        addTask,
        updateTask,
        moveTask,
        resizeTask,
        deleteTask,
        getTasksForDayAndTag,
    };
}

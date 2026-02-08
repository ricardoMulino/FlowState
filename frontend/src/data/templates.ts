import type { CategoryId } from "../types/calendar";

export interface TaskTemplate {
    id: string;
    title: string;
    duration: number; // minutes
    category: CategoryId;
    color: string;
}

export const TASK_TEMPLATES: TaskTemplate[] = [
    { id: 't1', title: 'Deep Work', duration: 90, category: 'work', color: '#3b82f6' },
    { id: 't2', title: 'Quick Meeting', duration: 30, category: 'work', color: '#3b82f6' },
    { id: 't3', title: 'Study Session', duration: 60, category: 'school', color: '#8b5cf6' },
    { id: 't4', title: 'Workout', duration: 45, category: 'hobbies', color: '#f97316' },
    { id: 't5', title: 'Reading', duration: 30, category: 'hobbies', color: '#f97316' },
];

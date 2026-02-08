<<<<<<< HEAD
import type { CategoryId } from "../types/calendar";
=======
import type { CategoryId } from '../types/calendarTypes';
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1

export interface TaskTemplate {
    id: string;
    title: string;
<<<<<<< HEAD
    duration: number; // minutes
=======
    duration: number;
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
    category: CategoryId;
    color: string;
}

<<<<<<< HEAD
export const TASK_TEMPLATES: TaskTemplate[] = [
    { id: 't1', title: 'Deep Work', duration: 90, category: 'work', color: '#3b82f6' },
    { id: 't2', title: 'Quick Meeting', duration: 30, category: 'work', color: '#3b82f6' },
    { id: 't3', title: 'Study Session', duration: 60, category: 'school', color: '#8b5cf6' },
    { id: 't4', title: 'Workout', duration: 45, category: 'hobbies', color: '#f97316' },
    { id: 't5', title: 'Reading', duration: 30, category: 'hobbies', color: '#f97316' },
=======
export const TEMPLATES: TaskTemplate[] = [
    { id: 'template-1', title: 'Deep Work', duration: 120, category: 'work', color: '#3b82f6' },
    { id: 'template-2', title: 'Quick Meeting', duration: 30, category: 'work', color: '#3b82f6' },
    { id: 'template-3', title: 'Study Session', duration: 90, category: 'school', color: '#8b5cf6' },
    { id: 'template-4', title: 'Gym', duration: 60, category: 'hobbies', color: '#f97316' },
    { id: 'template-5', title: 'Lunch Break', duration: 45, category: 'hobbies', color: '#f97316' },
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
];

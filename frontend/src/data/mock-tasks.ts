import type { Task } from '../types/calendarTypes';
import { addDays, setHours, setMinutes, startOfDay } from 'date-fns';

const today = startOfDay(new Date());

const createTask = (
    id: string,
    title: string,
    category: 'work' | 'school' | 'hobbies',
    dayOffset: number,
    hour: number,
    minute: number,
    duration: number,
    color: string
): Task => {
    const start = setMinutes(setHours(addDays(today, dayOffset), hour), minute);
    const end = setMinutes(setHours(addDays(today, dayOffset), hour + Math.floor((minute + duration) / 60)), (minute + duration) % 60);

    return {
        id,
        title,
        category,
        startTime: start,
        endTime: end,
        duration,
        color,
        isCompleted: false,
        estimatedTime: duration,
    };
};

export const MOCK_TASKS: Task[] = [
    // Work
    createTask('1', 'Client Meeting', 'work', 0, 9, 30, 120, '#3b82f6'),
    createTask('2', 'Code Review', 'work', 1, 14, 0, 60, '#3b82f6'),
    createTask('3', 'Deploy App', 'work', 3, 11, 0, 30, '#3b82f6'),

    // School
    createTask('4', 'Study Group', 'school', 0, 18, 0, 180, '#8b5cf6'),
    createTask('5', 'Assignment Due', 'school', 4, 16, 0, 0, '#ef4444'), // 0 duration for deadline marker logic if needed, or treated specially

    // Hobbies
    createTask('6', 'Gym', 'hobbies', 1, 7, 0, 60, '#f97316'),
    createTask('7', 'Read Book', 'hobbies', 2, 20, 0, 45, '#f97316'),
    createTask('8', 'Gaming Night', 'hobbies', 5, 21, 0, 120, '#f97316'),
];

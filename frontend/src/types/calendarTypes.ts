export type CategoryId = 'work' | 'school' | 'hobbies';

export interface Category {
    id: CategoryId;
    label: string;
    color: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    category: CategoryId;
    startTime: Date;
    endTime: Date;
    duration: number;
    color: string;
    isCompleted: boolean;
    estimatedTime: number;
}

export const CATEGORIES: Category[] = [
    { id: 'work', label: 'Work', color: '#3b82f6' },
    { id: 'school', label: 'School', color: '#8b5cf6' },
    { id: 'hobbies', label: 'Hobbies', color: '#f97316' },
];

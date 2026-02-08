export type CategoryId = string;

export interface Category {
    id: CategoryId;
    label: string;
    color: string;
}

export interface Task {
    id: string;
    taskClientId?: string; // Frontend-generated ID for matching WebSocket updates
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    color: string;
    isCompleted: boolean;
    estimatedTime: number;
    actualDuration?: number;
    recurrence?: string;
    tagNames?: string[];
    aiEstimationStatus?: 'loading' | 'success' | 'error';
    aiTimeEstimation?: number;
    aiRecommendation?: 'increase' | 'keep';
    aiReasoning?: string;
    aiConfidence?: 'high' | 'medium' | 'low';
}

export const CATEGORIES: Category[] = [
    { id: 'work', label: 'Work', color: '#3b82f6' },
    { id: 'school', label: 'School', color: '#8b5cf6' },
    { id: 'hobbies', label: 'Hobbies', color: '#f97316' },
];

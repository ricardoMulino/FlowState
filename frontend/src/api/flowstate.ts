/**
 * FlowState API Client
 * 
 * Provides type-safe API calls to the FastAPI backend.
 * Uses environment variables for configurable API base URL.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// ============================================================================
// TYPES
// ============================================================================

export interface User {
    _id?: string;
    email: string;
    description?: string;
}

export interface Tag {
    _id?: string;
    email: string;
    tag_name: string;
    tag_description?: string;
}

export interface Task {
    _id?: string;
    email: string;
    title: string;
    description?: string;
    tag_names?: string[];
    start_time?: string;
    // end_time removed
    duration?: number;
    is_completed?: boolean;
    recurrence?: string;
    color?: string;
    ai_estimation_status?: string;
    ai_time_estimation?: number;
    ai_recommendation?: string;
    ai_reasoning?: string;
    ai_confidence?: string;
}

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
    getAll: async (): Promise<User[]> => {
        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    get: async (email: string): Promise<User> => {
        const response = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    },

    getDescription: async (email: string): Promise<string> => {
        const response = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}/description`);
        if (!response.ok) throw new Error('Failed to fetch user description');
        const data = await response.json();
        return data.description;
    },

    create: async (email: string, description?: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, description }),
        });
        if (!response.ok) throw new Error('Failed to create user');
    },

    updateDescription: async (email: string, description: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}/description`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description }),
        });
        if (!response.ok) throw new Error('Failed to update user description');
    },

    delete: async (email: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
    },
};

// ============================================================================
// TAG API
// ============================================================================

export const tagAPI = {
    getAll: async (): Promise<Tag[]> => {
        const response = await fetch(`${API_BASE}/tags`);
        if (!response.ok) throw new Error('Failed to fetch tags');
        return response.json();
    },

    getAllForUser: async (email: string): Promise<Tag[]> => {
        const response = await fetch(`${API_BASE}/tags/${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error('Failed to fetch user tags');
        return response.json();
    },

    get: async (email: string, tagName: string): Promise<Tag> => {
        const response = await fetch(
            `${API_BASE}/tags/${encodeURIComponent(email)}/${encodeURIComponent(tagName)}`
        );
        if (!response.ok) throw new Error('Failed to fetch tag');
        return response.json();
    },

    getDescription: async (email: string, tagName: string): Promise<string> => {
        const response = await fetch(
            `${API_BASE}/tags/${encodeURIComponent(email)}/${encodeURIComponent(tagName)}/description`
        );
        if (!response.ok) throw new Error('Failed to fetch tag description');
        const data = await response.json();
        return data.tag_description;
    },

    create: async (email: string, tagName: string, tagDescription?: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, tag_name: tagName, tag_description: tagDescription }),
        });
        if (!response.ok) throw new Error('Failed to create tag');
    },

    updateDescription: async (email: string, tagName: string, tagDescription: string): Promise<void> => {
        const response = await fetch(
            `${API_BASE}/tags/${encodeURIComponent(email)}/${encodeURIComponent(tagName)}/description`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_description: tagDescription }),
            }
        );
        if (!response.ok) throw new Error('Failed to update tag description');
    },

    delete: async (email: string, tagName: string): Promise<void> => {
        const response = await fetch(
            `${API_BASE}/tags/${encodeURIComponent(email)}/${encodeURIComponent(tagName)}`,
            {
                method: 'DELETE',
            }
        );
        if (!response.ok) throw new Error('Failed to delete tag');
    },
};

// ============================================================================
// TASK API
// ============================================================================

export const taskAPI = {
    getAll: async (): Promise<Task[]> => {
        const response = await fetch(`${API_BASE}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return response.json();
    },

    getAllForUser: async (email: string): Promise<Task[]> => {
        const response = await fetch(`${API_BASE}/tasks/${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error('Failed to fetch user tasks');
        return response.json();
    },

    get: async (email: string, title: string): Promise<Task> => {
        const response = await fetch(
            `${API_BASE}/tasks/${encodeURIComponent(email)}/${encodeURIComponent(title)}`
        );
        if (!response.ok) throw new Error('Failed to fetch task');
        return response.json();
    },

    getById: async (taskId: string): Promise<Task> => {
        const response = await fetch(`${API_BASE}/tasks/by-id/${taskId}`);
        if (!response.ok) throw new Error('Failed to fetch task');
        return response.json();
    },

    getDescription: async (email: string, title: string): Promise<string> => {
        const response = await fetch(
            `${API_BASE}/tasks/${encodeURIComponent(email)}/${encodeURIComponent(title)}/description`
        );
        if (!response.ok) throw new Error('Failed to fetch task description');
        const data = await response.json();
        return data.description;
    },

    getTags: async (email: string, title: string): Promise<string[]> => {
        const response = await fetch(
            `${API_BASE}/tasks/${encodeURIComponent(email)}/${encodeURIComponent(title)}/tags`
        );
        if (!response.ok) throw new Error('Failed to fetch task tags');
        const data = await response.json();
        return data.tag_names;
    },

    getByTag: async (email: string, tagName: string): Promise<Task[]> => {
        const response = await fetch(
            `${API_BASE}/tasks/by-tag/${encodeURIComponent(email)}/${encodeURIComponent(tagName)}`
        );
        if (!response.ok) throw new Error('Failed to fetch tasks by tag');
        return response.json();
    },

    create: async (
        email: string,
        title: string,
        description?: string,
        tagNames?: string[],
        startTime?: Date,
        // endTime removed
        recurrence?: string,
        color?: string,
        taskClientId?: string,
        socketId?: string,
        aiEstimationStatus?: string
    ): Promise<void> => {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                title,
                task_client_id: taskClientId || crypto.randomUUID(),
                description,
                tag_names: tagNames,
                start_time: startTime?.toISOString(),
                // end_time removed
                recurrence,
                color,
                socket_id: socketId, // Pass to backend
                ai_estimation_status: aiEstimationStatus
            }),
        });
        if (!response.ok) throw new Error('Failed to create task');
    },

    update: async (taskId: string, updates: Partial<Task>): Promise<void> => {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update task');
    },

    updateDescription: async (email: string, title: string, description: string): Promise<void> => {
        const response = await fetch(
            `${API_BASE}/tasks/${encodeURIComponent(email)}/${encodeURIComponent(title)}/description`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description }),
            }
        );
        if (!response.ok) throw new Error('Failed to update task description');
    },

    updateTags: async (email: string, title: string, tagNames: string[]): Promise<void> => {
        const response = await fetch(
            `${API_BASE}/tasks/${encodeURIComponent(email)}/${encodeURIComponent(title)}/tags`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_names: tagNames }),
            }
        );
        if (!response.ok) throw new Error('Failed to update task tags');
    },

    addTag: async (email: string, title: string, tagName: string): Promise<void> => {
        const response = await fetch(
            `${API_BASE}/tasks/${encodeURIComponent(email)}/${encodeURIComponent(title)}/tags/add`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_name: tagName }),
            }
        );
        if (!response.ok) throw new Error('Failed to add tag to task');
    },

    removeTag: async (email: string, title: string, tagName: string): Promise<void> => {
        const response = await fetch(
            `${API_BASE}/tasks/${encodeURIComponent(email)}/${encodeURIComponent(title)}/tags/remove`,
            {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_name: tagName }),
            }
        );
        if (!response.ok) throw new Error('Failed to remove tag from task');
    },

    delete: async (email: string, title: string): Promise<void> => {
        const response = await fetch(
            `${API_BASE}/tasks/${encodeURIComponent(email)}/${encodeURIComponent(title)}`,
            {
                method: 'DELETE',
            }
        );
        if (!response.ok) throw new Error('Failed to delete task');
    },

    deleteById: async (taskId: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete task');
    },
};

// ============================================================================
// AGENT API (PLACEHOLDERS)
// ============================================================================

export const agentAPI = {
    chat: async (message: string, userId: string): Promise<any> => {
        const response = await fetch(`${API_BASE}/agent/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, user_id: userId }),
        });
        if (!response.ok) throw new Error('Failed to chat with agent');
        return response.json();
    },

    retrieve: async (query: string, userId: string): Promise<any> => {
        const response = await fetch(`${API_BASE}/agent/retrieve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, user_id: userId }),
        });
        if (!response.ok) throw new Error('Failed to retrieve events');
        return response.json();
    },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthCheck = async (): Promise<{ status: string; database: string }> => {
    const response = await fetch(`${API_BASE.replace('/api', '')}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
};

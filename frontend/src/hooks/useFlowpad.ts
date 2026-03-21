import { useState, useEffect, useCallback, useRef } from 'react';
import { padAPI } from '../api/flowstate';
import { useAuth } from '../contexts/AuthContext'; // Assuming this exists to get user email

export function useFlowpad(padId: string = 'dash_pad') {
    const { email } = useAuth(); // Or however email is obtained
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    // Use a ref to store the latest timeout ID for debouncing
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load initial pad content
    useEffect(() => {
        if (!email) return;
        let isMounted = true;
        
        const fetchPad = async () => {
            try {
                setIsLoading(true);
                const pad = await padAPI.get(email, padId);
                if (isMounted) {
                    setContent(pad.information || '');
                }
            } catch (error) {
                console.error('Failed to fetch flowpad:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPad();
        
        return () => {
            isMounted = false;
        };
    }, [email, padId]);

    // Save with debounce
    const updateContent = useCallback((newContent: string) => {
        setContent(newContent);
        
        if (!email) return;

        // Clear existing timeout if it exists
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set a new timeout to save after user stops typing for 1 second
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await padAPI.set(email, padId, newContent);
            } catch (error) {
                console.error('Failed to save flowpad:', error);
            }
        }, 1000);
        
    }, [email, padId]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return {
        content,
        updateContent,
        isLoading
    };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { settingsAPI } from '../api/flowstate';
import type { Settings } from '../api/flowstate';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to manage user settings.
 * Follows the pattern of useFlowpad for consistency.
 * Supports extensible settings by using Partial<Settings> for updates.
 */
export function useSettings() {
    const { email } = useAuth();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Use a ref to store the latest timeout ID for debouncing saves
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load settings when email is available
    useEffect(() => {
        if (!email) return;
        let isMounted = true;

        const fetchSettings = async () => {
            try {
                setIsLoading(true);
                const data = await settingsAPI.get(email);
                if (isMounted) {
                    setSettings(data);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
                // Fallback to defaults if fetch fails (e.g., if user doesn't have settings yet)
                if (isMounted) {
                    setSettings({ email, light_mode: false });
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchSettings();

        return () => {
            isMounted = false;
        };
    }, [email]);

    /**
     * Updates one or more settings.
     * Performs an optimistic update of the local state and debounces the API call.
     */
    const updateSettings = useCallback((updates: Partial<Settings>) => {
        if (!settings || !email) return;

        // Optimistic update
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);

        // Clear existing timeout if it exists
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set a new timeout to save after 1 second of inactivity
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await settingsAPI.set(email, updates);
                console.log('Settings saved successfully');
            } catch (error) {
                console.error('Failed to save settings:', error);
                // Optionally: revert state on failure if critical
            }
        }, 1000);
    }, [email, settings]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return {
        settings,
        updateSettings,
        isLoading
    };
}

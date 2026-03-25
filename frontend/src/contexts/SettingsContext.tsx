import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useSettings } from '../hooks/useSettings';
import type { Settings } from '../api/flowstate';

interface SettingsContextType {
    settings: Settings | null;
    updateSettings: (updates: Partial<Settings>) => void;
    isLoading: boolean;
    isDarkMode: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { settings, updateSettings, isLoading } = useSettings();

    // Derived state for convenience
    // In our app, dark mode is active by default (light_mode: false)
    const isDarkMode = settings ? !settings.light_mode : true;

    return (
        <SettingsContext.Provider value={{ 
            settings, 
            updateSettings, 
            isLoading,
            isDarkMode 
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettingsContext = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettingsContext must be used within a SettingsProvider');
    }
    return context;
};

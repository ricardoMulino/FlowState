import { createContext, useContext, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useCalendarState } from '../hooks/useCalendarState';
import type { Task } from '../types/calendarTypes';

interface CalendarContextType {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
    timeZone: string;
    setTimeZone: (tz: string) => void;
    tasks: Task[];
    addTask: (task: Task, socketId?: string) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    moveTask: (id: string, newStartTime: Date, newTag?: string) => void;
    resizeTask: (id: string, newDuration: number) => void;
    deleteTask: (id: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
    const { email } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const calendarState = useCalendarState(email);

    return (
        <CalendarContext.Provider value={{
            currentDate,
            setCurrentDate,
            timeZone,
            setTimeZone,
            ...calendarState
        }}>
            {children}
        </CalendarContext.Provider>
    );
};

export const useCalendar = () => {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
};

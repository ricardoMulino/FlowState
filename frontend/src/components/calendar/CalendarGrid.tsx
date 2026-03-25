import React, { useState, useEffect, useRef } from 'react';
import { DayCell } from './DayCell';
import { type Task } from '../../types/calendarTypes';
import { cn } from '../../lib/utils';
import { TaskDetailsModal } from '../modals/TaskDetailsModal';
import { isSameDay } from 'date-fns';
import { useCalendar } from '../../contexts/CalendarContext';

interface CalendarGridProps {
    tasks: Task[];
    currentDate: Date;
    viewMode: 'week' | 'day';
    onDateSelect: (date: Date) => void;
    onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
    onTaskDelete: (taskId: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
    tasks,
    currentDate,
    viewMode,
    onDateSelect,
    onTaskUpdate,
    onTaskDelete
}) => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const { timeZone } = useCalendar();

    const [currentTimeData, setCurrentTimeData] = useState(() => {
        const now = new Date();
        const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            const timeParts = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, hour: 'numeric', minute: 'numeric', hour12: false
            }).formatToParts(now);
            let h = parseInt(timeParts.find(p => p.type === 'hour')?.value || '0', 10);
            if (h === 24) h = 0;
            return { hours: h, minutes: parseInt(timeParts.find(p => p.type === 'minute')?.value || '0', 10) };
        } catch {
            return { hours: now.getHours(), minutes: now.getMinutes() };
        }
    });

    const [todayInTimeZone, setTodayInTimeZone] = useState(() => {
        const now = new Date();
        const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            const dateParts = new Intl.DateTimeFormat('en-US', {
                timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric'
            }).formatToParts(now);
            const y = parseInt(dateParts.find(p => p.type === 'year')?.value || '0');
            const m = parseInt(dateParts.find(p => p.type === 'month')?.value || '1') - 1;
            const d = parseInt(dateParts.find(p => p.type === 'day')?.value || '1');
            return new Date(y, m, d);
        } catch {
            return now;
        }
    });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const tz = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
            try {
                // Time
                const timeParts = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz, hour: 'numeric', minute: 'numeric', hour12: false
                }).formatToParts(now);
                let h = parseInt(timeParts.find(p => p.type === 'hour')?.value || '0', 10);
                if (h === 24) h = 0;
                setCurrentTimeData({ hours: h, minutes: parseInt(timeParts.find(p => p.type === 'minute')?.value || '0', 10) });

                // Date
                const dateParts = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric'
                }).formatToParts(now);
                const y = parseInt(dateParts.find(p => p.type === 'year')?.value || '0');
                const m = parseInt(dateParts.find(p => p.type === 'month')?.value || '1') - 1;
                const d = parseInt(dateParts.find(p => p.type === 'day')?.value || '1');
                setTodayInTimeZone(new Date(y, m, d));
            } catch {
                setCurrentTimeData({ hours: now.getHours(), minutes: now.getMinutes() });
                setTodayInTimeZone(now);
            }
        };

        const timer = setInterval(updateTime, 60000);
        return () => clearInterval(timer);
    }, [timeZone]);

    const currentTimeTop = (currentTimeData.hours + currentTimeData.minutes / 60) * 60;

    // Dynamically compute 'GMT-X' safely taking into account the user's saved contextual timezone
    const gmtOffset = React.useMemo(() => {
        try {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                timeZoneName: 'shortOffset'
            }).formatToParts(new Date());
            return parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT';
        } catch {
            return 'GMT';
        }
    }, [timeZone]);

    // Calculate Week Range based on currentDate
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Always start on Sunday

    // Header Days (Always 7 days)
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    // Body Days (Depends on View Mode)
    const bodyDays = viewMode === 'week' ? weekDays : [currentDate];

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            // Auto-scroll to center the current time indicator vertically on initial load
            const containerHeight = scrollContainerRef.current.clientHeight;
            scrollContainerRef.current.scrollTop = currentTimeTop - (containerHeight / 2);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
                {/* Main Scroll Container */}
                <div ref={scrollContainerRef} className="flex-1 overflow-auto relative scroll-smooth">
                    <div className="flex min-w-max flex-col">
                        {/* Wrapper for the entire grid content to ensure min-width applies */}
                        <div className="flex">
                            {/* Sticky Time Sidebar */}
                            <div className="sticky left-0 z-30 w-20 flex-shrink-0 bg-slate-950 border-r border-white/10">
                                <div className="sticky top-0 z-40 h-[69px] bg-slate-900/95 backdrop-blur-sm border-b border-white/10 flex items-center justify-center text-[11px] font-bold text-slate-400 shadow-sm">
                                    {gmtOffset}
                                </div>

                                {/* Time Labels Column */}
                                <div className="relative bg-slate-950/20">
                                    {/* Spacer for 12 AM - 1 AM */}
                                    <div className="h-[60px]" />
                                    {Array.from({ length: 23 }, (_, i) => i + 1).map((hour) => (
                                        <div
                                            key={hour}
                                            className="h-[60px] relative text-sm text-slate-400 font-semibold"
                                        >
                                            <span className="absolute right-3 top-0 -translate-y-1/2 bg-slate-950/20 px-1 rounded z-10">
                                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex flex-col flex-1">
                                {/* Sticky Header Row */}
                                <div className="sticky top-0 z-20 flex border-b border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-sm h-[69px]">
                                    {bodyDays.map((day) => {
                                        const isSelected = isSameDay(day, currentDate);
                                        const isTodayDate = isSameDay(day, todayInTimeZone);

                                        return (
                                            <div
                                                key={day.toISOString()}
                                                onClick={() => onDateSelect(day)}
                                                className={cn(
                                                    "flex-1 p-3 text-center border-l border-white/10 cursor-pointer transition-colors hover:bg-white/5 flex flex-col justify-center",
                                                    isSelected && viewMode === 'day' && "bg-blue-500/10",
                                                    isTodayDate && !isSelected && "bg-white/5",
                                                    viewMode === 'week' ? "min-w-[150px]" : "min-w-0" // Minimum width for week view columns
                                                )}
                                            >
                                                <div className={cn(
                                                    "text-xs uppercase mb-1",
                                                    isSelected && viewMode === 'day' ? "text-blue-400 font-bold" : "text-slate-400"
                                                )}>
                                                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </div>
                                                <div className={cn(
                                                    "text-lg font-bold w-8 h-8 flex items-center justify-center mx-auto rounded-full transition-all",
                                                    isTodayDate ? "bg-blue-600 text-white" :
                                                        (isSelected && viewMode === 'day' ? "bg-blue-500/20 text-blue-400" : "text-slate-200")
                                                )}>
                                                    {day.getDate()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Calendar Body (Tasks) */}
                                <div className={cn(
                                    "flex flex-1 relative min-h-[1440px]",
                                )}>
                                    {bodyDays.map((day) => {
                                        const isTodayDate = isSameDay(day, todayInTimeZone);
                                        return (
                                        <div
                                            key={day.toISOString()}
                                            className={cn(
                                                "flex flex-1 flex-col border-l border-white/10 first:border-0 relative h-[1440px]",
                                                viewMode === 'week' ? "min-w-[150px]" : "min-w-0",
                                                isTodayDate && "bg-blue-500/5"
                                            )}
                                        >
                                            {/* Google Calendar Style Current Time Line */}
                                            {isTodayDate && (
                                                <div 
                                                    className="absolute left-0 right-0 border-t-2 border-blue-500 z-40 pointer-events-none shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                                    style={{ top: `${currentTimeTop}px` }}
                                                >
                                                    <div className="absolute -left-1.5 -top-[5px] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                                </div>
                                            )}
                                            
                                            <DayCell
                                                day={day}
                                                category="work"
                                                tasks={tasks.filter(t => {
                                                    const dayStart = new Date(day);
                                                    dayStart.setHours(0, 0, 0, 0);
                                                    const dayEnd = new Date(day);
                                                    dayEnd.setHours(23, 59, 59, 999);
                                                    // Use endTime (always valid after useCalendarState fix)
                                                    const taskEnd = t.endTime instanceof Date && !isNaN(t.endTime.getTime())
                                                        ? t.endTime
                                                        : new Date(t.startTime.getTime() + t.duration * 60000);
                                                    return t.startTime <= dayEnd && taskEnd > dayStart;
                                                })}
                                                onEdit={setEditingTask}
                                                onUpdate={onTaskUpdate}
                                            />
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Extra scroll space at the bottom allowing vertical column lines to terminate perfectly at 1440px */}
                        <div className="h-[60px] w-full shrink-0" />
                    </div>
                </div>
            </div>

            {editingTask && (
                <TaskDetailsModal
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    task={editingTask}
                    onSave={onTaskUpdate}
                    onDelete={onTaskDelete}
                />
            )}
        </>
    );
};

// isSameDay is imported from date-fns now


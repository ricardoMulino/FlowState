import React, { useState } from 'react';
import { DayCell } from './DayCell';
import { type Task } from '../../types/calendarTypes';
import { cn } from '../../lib/utils';
import { TaskDetailsModal } from '../modals/TaskDetailsModal';
import { isSameDay } from 'date-fns';

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

    return (
        <>
            <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
                {/* Main Scroll Container */}
                <div className="flex-1 overflow-auto relative scroll-smooth">
                    <div className="flex min-w-max flex-col">
                        {/* Wrapper for the entire grid content to ensure min-width applies */}
                        <div className="flex">
                            {/* Sticky Time Sidebar */}
                            <div className="sticky left-0 z-30 w-20 flex-shrink-0 bg-slate-950 border-r border-white/10">
                                {/* Top-Left Corner "Time" Label (Sticky in both directions) */}
                                <div className="sticky top-0 z-40 h-[69px] bg-slate-900/95 backdrop-blur-sm border-b border-white/10 flex items-center justify-center text-xs font-medium text-slate-400 shadow-sm">
                                    Time
                                </div>

                                {/* Time Labels Column */}
                                <div className="relative bg-slate-900/30 pb-[60px]">
                                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                                        <div
                                            key={hour}
                                            className="h-[60px] text-xs text-slate-500 text-right pr-3 pt-1 font-medium transform -translate-y-2"
                                        >
                                            {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                                        </div>
                                    ))}
                                    {/* 12 AM Bottom Label */}
                                    <div
                                        className="absolute left-0 right-0 h-auto text-xs text-slate-500 text-right pr-3 pt-1 font-medium"
                                        style={{ top: '1440px' }}
                                    >
                                        12 AM
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex flex-col flex-1">
                                {/* Sticky Header Row */}
                                <div className="sticky top-0 z-20 flex border-b border-white/10 bg-slate-900/95 backdrop-blur-sm shadow-sm h-[69px]">
                                    {weekDays.map((day) => {
                                        const isSelected = isSameDay(day, currentDate);
                                        const isTodayDate = isToday(day);

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
                                    "flex flex-1 relative min-h-[1440px] pb-[60px]", // pb-[60px] to match sidebar spacing
                                )}>
                                    {bodyDays.map((day) => (
                                        <div
                                            key={day.toISOString()}
                                            className={cn(
                                                "flex flex-1 flex-col border-l border-white/10 first:border-0 relative h-[1440px]",
                                                viewMode === 'week' ? "min-w-[150px]" : "min-w-0"
                                            )}
                                        >
                                            <DayCell
                                                day={day}
                                                category="work"
                                                tasks={tasks.filter(t => isSameDay(t.startTime, day))}
                                                onEdit={setEditingTask}
                                                onUpdate={onTaskUpdate}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
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

function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

// isSameDay is imported from date-fns now


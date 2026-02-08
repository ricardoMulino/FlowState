import React from 'react';
<<<<<<< HEAD
import DayCell from './DayCell';
import { type Task, type CategoryId, CATEGORIES } from '../../types/calendar';
import { cn } from '../../lib/utils';
import type { TaskTemplate } from '../../data/templates';

=======
import { DndContext, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { DayCell } from './DayCell';
import { type Task, type CategoryId, CATEGORIES } from '../../types/calendarTypes';
import { SmoothDraggableTask } from './SmoothDraggableTask';
import { cn } from '../../lib/utils';
import type { TaskTemplate } from '../../data/templates';

<<<<<<< HEAD
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
interface CalendarGridProps {
    tasks: Task[];
    onTaskMove: (taskId: string, newStartTime: Date, newCategory: string) => void;
    onTaskCreate?: (template: TaskTemplate, startTime: Date, category: string) => void;
}
<<<<<<< HEAD

export const CalendarGrid: React.FC<CalendarGridProps> = ({ tasks }) => {
=======
=======
const CalendarGrid: React.FC = () => {
    const { tasks, moveTask, resizeTask } = useCalendarState();
    const { sensors, handleDragStart, handleDragEnd: coreHandleDragEnd, activeId } = useDragAndDrop(moveTask);
>>>>>>> abeb5dfc8d77bb1c827f249bf92a96dfb9e7dad3

export const CalendarGrid: React.FC<CalendarGridProps> = ({ tasks, onTaskMove, onTaskCreate }) => {
    const { sensors, activeTask, activeTemplate, handleDragStart, handleDragEnd } = useDragAndDrop({
        tasks,
        onTaskMove,
        onTaskCreate
    });

>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
    // Get current week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

<<<<<<< HEAD
    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-100">
            {/* Header */}
            <div className="flex border-b border-white/10 bg-slate-900/50">
                <div className="w-20 p-3 text-xs font-medium text-slate-400">Time</div>
                {days.map((day) => (
                    <div
                        key={day.toISOString()}
                        className={cn(
                            "flex-1 p-3 text-center border-l border-white/10",
                            isToday(day) && "bg-blue-500/10"
                        )}
                    >
                        <div className="text-xs text-slate-400 uppercase">
                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={cn(
                            "text-lg font-bold",
                            isToday(day) ? "text-blue-400" : "text-slate-200"
                        )}>
                            {day.getDate()}
                        </div>
=======
    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-full bg-slate-950 text-slate-100">
                {/* Header */}
                <div className="flex border-b border-white/10 bg-slate-900/50">
                    <div className="w-20 p-3 text-xs font-medium text-slate-400">Time</div>
                    {days.map((day) => (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "flex-1 p-3 text-center border-l border-white/10",
                                isToday(day) && "bg-blue-500/10"
                            )}
                        >
                            <div className="text-xs text-slate-400 uppercase">
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className={cn(
                                "text-lg font-bold",
                                isToday(day) ? "text-blue-400" : "text-slate-200"
                            )}>
                                {day.getDate()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Calendar Body */}
                <div className="flex flex-1 overflow-auto">
                    {/* Time Labels */}
                    <div className="w-20 flex-shrink-0 border-r border-white/10 bg-slate-900/30">
                        {Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => (
                            <div
                                key={hour}
                                className="h-[60px] text-xs text-slate-500 text-right pr-3 pt-1 font-medium"
                            >
                                {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="flex flex-1 min-w-[800px]">
                        {days.map((day) => (
                            <div key={day.toISOString()} className="flex flex-1 flex-col">
                                {/* Category Rows */}
                                <div className="flex flex-col flex-1">
                                    {CATEGORIES.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex-1 border-b border-white/5 last:border-b-0"
                                            style={{
                                                backgroundColor: `${cat.color}05`
                                            }}
                                        >
                                            <DayCell
                                                date={day}
                                                category={cat.id as CategoryId}
                                                tasks={tasks.filter(t =>
                                                    isSameDay(t.startTime, day) && t.category === cat.id
                                                )}
                                                color={cat.color}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
                    </div>
                ))}
            </div>

            {/* Calendar Body */}
            <div className="flex flex-1 overflow-auto">
                {/* Time Labels */}
                <div className="w-20 flex-shrink-0 border-r border-white/10 bg-slate-900/30">
                    {Array.from({ length: 18 }, (_, i) => i + 6).map((hour) => (
                        <div
                            key={hour}
                            className="h-[60px] text-xs text-slate-500 text-right pr-3 pt-1 font-medium"
                        >
                            {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </div>
                    ))}
                </div>
<<<<<<< HEAD

                {/* Days */}
                <div className="flex flex-1 min-w-[800px]">
                    {days.map((day) => (
                        <div key={day.toISOString()} className="flex flex-1 flex-col">
                            {/* Category Rows */}
                            <div className="flex flex-col flex-1">
                                {CATEGORIES.map((cat) => (
                                    <div
                                        key={cat.id}
                                        className="flex-1 border-b border-white/5 last:border-b-0"
                                        style={{
                                            backgroundColor: `${cat.color}05`
                                        }}
                                    >
                                        <DayCell
                                            day={day}
                                            category={cat.id as CategoryId}
                                            tasks={tasks.filter(t =>
                                                isSameDay(t.startTime, day) && t.category === cat.id
                                            )}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
=======
            </div>

            {/* Drag Overlay - This creates the smooth floating effect */}
            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                    <div style={{ width: '200px' }}>
                        <SmoothDraggableTask task={activeTask} isOverlay />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
    );
};

function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

function isSameDay(d1: Date, d2: Date): boolean {
    return d1.toDateString() === d2.toDateString();
<<<<<<< HEAD
}
=======
}
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1

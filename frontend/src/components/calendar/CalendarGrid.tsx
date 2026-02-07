import React from 'react';
import { format, addDays, startOfWeek, eachDayOfInterval } from 'date-fns';
import { CATEGORIES } from '../../types/calendar';
import { useCalendarState } from '../../hooks/useCalendarState';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import DayCell from './DayCell';
import DraggableTask from './DraggableTask';
import { createPortal } from 'react-dom';

const CalendarGrid: React.FC = () => {
    const { tasks, moveTask, resizeTask } = useCalendarState();
    const { sensors, handleDragStart, handleDragEnd: coreHandleDragEnd, activeId } = useDragAndDrop(moveTask);

    // Date Logic
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });
    const end = addDays(start, 6);
    const days = eachDayOfInterval({ start, end });

    const handleDragEnd = (event: any) => {
        coreHandleDragEnd(event, resizeTask);
    };

    // Helper to find active task for overlay
    const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-full select-none">
                {/* Header: Days */}
                <div className="flex border-b border-white/10 bg-black/20 sticky top-0 z-20 backdrop-blur-md">
                    <div className="w-24 shrink-0 border-r border-white/10 p-4 font-bold text-slate-400 flex items-center justify-center">
                        Category
                    </div>
                    <div className="flex-1 grid grid-cols-7 divide-x divide-white/5">
                        {days.map((day) => (
                            <div key={day.toISOString()} className="p-3 text-center">
                                <div className="text-xs font-medium text-slate-500 uppercase">{format(day, 'EEE')}</div>
                                <div className={`text-xl font-bold ${format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? 'text-blue-400' : 'text-slate-300'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body: Categories -> Days */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {CATEGORIES.map((category) => (
                        <div key={category.id} className="flex border-b border-white/5 min-h-[400px]">
                            {/* Category Label */}
                            <div
                                className="w-24 shrink-0 border-r border-white/10 p-4 font-semibold text-slate-400 flex items-center justify-center writing-mode-vertical rotate-180 sticky left-0 bg-slate-950/95 z-10"
                                style={{ color: category.color }}
                            >
                                <span className="rotate-90 whitespace-nowrap">{category.label}</span>
                            </div>

                            {/* Days Grid for this Category */}
                            <div className="flex-1 grid grid-cols-7 divide-x divide-white/5 relative">
                                {days.map((day) => (
                                    <DayCell
                                        key={day.toISOString()}
                                        day={day}
                                        category={category.id}
                                        tasks={tasks.filter(t =>
                                            t.category === category.id &&
                                            format(t.startTime, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Drag Overlay */}
            {createPortal(
                <DragOverlay>
                    {activeTask ? (
                        <div className="opacity-90 transform scale-105" style={{ height: `${activeTask.duration * (40 / 30)}px` }}>
                            <DraggableTask task={activeTask} />
                            {/* Note: DraggableTask might have absolute positioning styles that conflict. 
                                Ideally, we render a pure visual component here. 
                                But reusing DraggableTask is okay if we override styles.
                            */}
                        </div>
                    ) : null}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
};

export default CalendarGrid;

import React, { useState } from 'react';
import type { CategoryId, Task } from '../../types/calendar';
import TimeBlock from './TimeBlock';
import DraggableTask from './DraggableTask';
import { differenceInMinutes, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface DayCellProps {
    day: Date;
    category: CategoryId;
    tasks: Task[];
}

const DayCell: React.FC<DayCellProps> = ({ day, category, tasks }) => {
    const [isHovered, setIsHovered] = useState(false);
    const slots = [];
    const startHour = 6;
    const endHour = 23;

    for (let h = startHour; h <= endHour; h++) {
        slots.push({ hour: h, minute: 0 });
        if (h < endHour) {
            slots.push({ hour: h, minute: 30 });
        }
    }

    const getTaskPosition = (task: Task) => {
        const startOfGrid = new Date(day);
        startOfGrid.setHours(startHour, 0, 0, 0);
        const diff = differenceInMinutes(task.startTime, startOfGrid);
        return Math.max(0, diff * (40 / 30));
    };

    const totalEstimated = tasks.reduce((acc, t) => acc + t.estimatedTime, 0);

    return (
        <div
            className="relative h-full min-h-[calc(18*40px)] group transition-colors hover:bg-white/[0.02]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Slots (Droppable) */}
            <div className="absolute inset-0 flex flex-col z-0">
                {slots.map((slot, i) => (
                    <TimeBlock
                        key={`${i}-${slot.hour}-${slot.minute}`}
                        day={day}
                        hour={slot.hour}
                        minute={slot.minute}
                        category={category}
                    />
                ))}
            </div>

            {/* Tasks Layer */}
            <div className="absolute inset-0 pointer-events-none z-10">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="absolute w-full pointer-events-auto pl-1 pr-2 py-1"
                        style={{ top: `${getTaskPosition(task)}px` }}
                    >
                        <DraggableTask task={task} />
                    </div>
                ))}
            </div>

            {/* Popover */}
            <AnimatePresence>
                {isHovered && tasks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-2 right-2 z-50 w-48 p-3 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-none"
                    >
                        <div className="text-xs font-semibold text-slate-300 mb-2 border-b border-white/10 pb-1">
                            {format(day, 'EEEE, MMM d')}
                        </div>
                        <div className="space-y-1">
                            {tasks.map(t => (
                                <div key={t.id} className="text-[10px] flex justify-between text-slate-400">
                                    <span className="truncate flex-1">{t.title}</span>
                                    <span>{t.duration}m</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 pt-1 border-t border-white/10 text-[10px] text-right text-blue-400 font-medium">
                            Total: {Math.floor(totalEstimated / 60)}h {totalEstimated % 60}m
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DayCell;

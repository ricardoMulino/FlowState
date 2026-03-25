import React from 'react';
import type { Task, CategoryId } from '../../types/calendarTypes';
import { SmoothDraggableTask } from './SmoothDraggableTask';
import { SnapGrid } from './SnapGrid';

interface DayCellProps {
    day: Date;
    category?: CategoryId; // Optional now, or defaults to specific logic
    tasks: Task[];
    onEdit?: (task: Task) => void;
    onUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

/**
 * Computes a z-index for each task based on overlap stacking rules:
 *  - Tasks that overlap in time are grouped.
 *  - Within a group, earliest start time → lowest z-index (bottom of stack).
 *  - If two tasks share the same start time, the shorter one goes on top (higher z-index).
 *
 * Returns a Map<taskId, zIndex>.
 */
function computeOverlapZIndex(tasks: Task[]): Map<string, number> {
    const result = new Map<string, number>();

    // Sort a working copy: primary = startTime ASC, secondary = duration DESC (longer → lower z)
    const sorted = [...tasks].sort((a, b) => {
        const timeDiff = a.startTime.getTime() - b.startTime.getTime();
        if (timeDiff !== 0) return timeDiff;
        // Same start time: longer duration goes first (bottom), shorter on top
        return b.duration - a.duration;
    });

    // Build overlap groups using a sweep-line approach
    // Each group is a set of task ids that mutually overlap with at least one other task in the group
    const groups: string[][] = [];
    const assigned = new Set<string>();

    for (let i = 0; i < sorted.length; i++) {
        if (assigned.has(sorted[i].id)) continue;

        const group: string[] = [sorted[i].id];
        assigned.add(sorted[i].id);

        // Expand group: find all tasks that overlap with ANY task already in the group
        let expanded = true;
        while (expanded) {
            expanded = false;
            for (let j = 0; j < sorted.length; j++) {
                if (assigned.has(sorted[j].id)) continue;
                const candidate = sorted[j];
                const overlapsGroup = group.some((id) => {
                    const t = tasks.find((x) => x.id === id)!;
                    return tasksOverlap(t, candidate);
                });
                if (overlapsGroup) {
                    group.push(candidate.id);
                    assigned.add(candidate.id);
                    expanded = true;
                }
            }
        }

        groups.push(group);
    }

    // Assign z-indexes: within each group, rank by sort order (index in `sorted`)
    // The first in sort order gets z=10 (bottom), each subsequent gets +1
    for (const group of groups) {
        // Re-sort group members by their position in `sorted`
        const ranked = group.sort(
            (a, b) =>
                sorted.findIndex((t) => t.id === a) -
                sorted.findIndex((t) => t.id === b)
        );
        ranked.forEach((id, rank) => {
            result.set(id, 10 + rank);
        });
    }

    return result;
}

/** Returns true if two tasks overlap in time (exclusive boundaries). */
function tasksOverlap(a: Task, b: Task): boolean {
    const aEnd = a.endTime instanceof Date && !isNaN(a.endTime.getTime())
        ? a.endTime
        : new Date(a.startTime.getTime() + a.duration * 60000);
    const bEnd = b.endTime instanceof Date && !isNaN(b.endTime.getTime())
        ? b.endTime
        : new Date(b.startTime.getTime() + b.duration * 60000);
    return a.startTime < bEnd && aEnd > b.startTime;
}

export const DayCell: React.FC<DayCellProps> = ({
    day,
    category = 'work',
    tasks,
    onEdit,
    onUpdate
}) => {
    // Build boundary dates once — never mutate the `day` prop inline
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    // Compute per-task z-indexes for overlap stacking
    const zIndexMap = computeOverlapZIndex(tasks);

    return (
        <SnapGrid date={day} category={category}>
            <div className="relative h-full">
                {tasks.map((task) => {
                    // Fallback endTime in case task.endTime is missing
                    const endTime = task.endTime instanceof Date && !isNaN(task.endTime.getTime())
                        ? task.endTime
                        : new Date(task.startTime.getTime() + task.duration * 60000);

                    const effectiveStart = dateMax(task.startTime, dayStart);
                    const effectiveEnd = dateMin(endTime, dayEnd);

                    const top = getYPosition(effectiveStart);
                    const height = getYPosition(effectiveEnd) - top;
                    const zIndex = zIndexMap.get(task.id) ?? 10;

                    return (
                        <div
                            key={task.id}
                            className="absolute w-full overflow-hidden"
                            style={{ top: `${top}px`, height: `${height}px`, zIndex }}
                        >
                            <SmoothDraggableTask task={task} onEdit={onEdit} onUpdate={onUpdate} />
                        </div>
                    );
                })}
            </div>
        </SnapGrid>
    );
};

function getYPosition(date: Date): number {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return (hour + minute / 60) * 60;
}

function dateMax(date1: Date, date2: Date): Date {
    return date1 > date2 ? date1 : date2;
}

function dateMin(date1: Date, date2: Date): Date {
    return date1 < date2 ? date1 : date2;
}
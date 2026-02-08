import { useState } from 'react';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { TaskSidebar } from '../components/sidebar/TaskSidebar';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { useTags } from '../hooks/useTags';
import type { Category } from '../types/calendarTypes';
import { CATEGORIES } from '../types/calendarTypes';
import { DndContext, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { SmoothDraggableTask } from '../components/calendar/SmoothDraggableTask';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewSwitcher, type CalendarViewMode } from '../components/calendar/ViewSwitcher';
import { MonthView } from '../components/calendar/MonthView';
import { YearView } from '../components/calendar/YearView';
import { useAuth } from '../contexts/AuthContext';
import { useCalendar } from '../contexts/CalendarContext';

export const Dashboard = () => {
    const { email } = useAuth();

    const {
        currentDate,
        setCurrentDate,
        tasks,
        addTask,
        updateTask,
        moveTask,
        deleteTask
    } = useCalendar();

    const { tags } = useTags(email);
    const { socketId, lastMessage } = useWebSocket();

    // Listen for AI estimation results
    useEffect(() => {
        if (lastMessage?.type === 'agent_result' && lastMessage.task_client_id) {
            console.log('AI Estimation received:', lastMessage);
            const { task_client_id, duration, recommendation, reasoning, confidence } = lastMessage;

            // Find the task by taskClientId (for new tasks) or id (fallback for older tasks)
            const task = tasks.find(t => t.taskClientId === task_client_id || t.id === task_client_id);
            if (task) {
                const newEndTime = addMinutes(task.startTime, duration > 0 ? duration : task.duration);
                updateTask(task.id, {
                    duration: duration > 0 ? duration : task.duration,
                    endTime: newEndTime,
                    estimatedTime: duration,
                    aiEstimationStatus: duration > 0 ? 'success' : 'error',
                    aiTimeEstimation: duration,
                    aiRecommendation: recommendation || 'keep',
                    aiReasoning: reasoning,
                    aiConfidence: confidence
                });
            } else {
                console.warn('Task not found for AI estimation:', task_client_id);
            }
        } else if (lastMessage?.type === 'agent_error' && lastMessage.task_client_id) {
            const task = tasks.find(t => t.taskClientId === lastMessage.task_client_id || t.id === lastMessage.task_client_id);
            if (task) {
                updateTask(task.id, {
                    aiEstimationStatus: 'error'
                });
            }
        }
    }, [lastMessage, tasks, updateTask]);

    // Merge default categories with fetched tags
    // We treat tags as categories for now
    const dynamicCategories: Category[] = [
        ...CATEGORIES,
        ...tags
            .filter(t => !CATEGORIES.some(c => c.id === t.tag_name)) // Avoid duplicates
            .map(t => ({
                id: t.tag_name,
                label: t.tag_name,
                color: t.color || '#64748b' // Default color if not specified
            }))
    ];

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isDragExpanded, setIsDragExpanded] = useState(false);
    const [filterTag, setFilterTag] = useState<string | 'all'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Calendar State
    // currentDate is now from context
    const [viewMode, setViewMode] = useState<CalendarViewMode>('week');

    // Navigation handlers
    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentDate(newDate);
    };

    // Get recent tasks (sorted by creation/start time, most recent first)
    const recentTasks = [...tasks]
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .slice(0, 5);

    // Filter tasks for the calendar
    const filteredTasks = filterTag === 'all'
        ? tasks
        : tasks.filter(t => t.tagNames?.includes(filterTag));


    const { sensors, activeTask, activeTemplate, handleDragStart, handleDragEnd } = useDragAndDrop({
        tasks,
        onTaskMove: moveTask,
        onTaskCreate: (template, startTime, tag) => {
            const clientId = window.crypto.randomUUID();
            addTask({
                id: clientId,
                taskClientId: clientId, // Same ID for WebSocket matching before fetch
                title: template.title,
                tagNames: tag ? [tag] : [],
                startTime,
                endTime: new Date(startTime.getTime() + template.duration * 60000),
                duration: template.duration,
                color: template.color,
                isCompleted: false,
                estimatedTime: template.duration,
                recurrence: template.recurrence,
                actualDuration: undefined,
                aiEstimationStatus: 'loading'
            }, socketId);
        }
    });

    const onDragStart = (event: any) => {
        handleDragStart(event);
        if (!isSidebarOpen && event.active?.data?.current?.type === 'template') {
            setIsDragExpanded(true);
        }
    };

    const onDragEnd = (event: any) => {
        handleDragEnd(event);
        setIsDragExpanded(false);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    const handleDateSelect = (date: Date) => {
        setCurrentDate(date);
        setViewMode('day'); // Switch to day view on click
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="flex-1 mt-4 flex gap-4 overflow-hidden h-full">
                <TaskSidebar
                    recentTasks={recentTasks}
                    onOpenCreateModal={() => setIsCreateModalOpen(true)}
                    isOpen={isSidebarOpen || isDragExpanded}
                    onToggle={() => setIsSidebarOpen(prev => !prev)}
                    filter={filterTag}
                    onFilterChange={setFilterTag}
                    categories={dynamicCategories}
                />
                <main className="flex-1 overflow-hidden relative glass-panel rounded-2xl flex flex-col">
                    {/* Header Controls */}
                    <div className="flex justify-between items-center p-4 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigateMonth('prev')}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 min-w-[200px] text-center">
                                {viewMode === 'year'
                                    ? currentDate.getFullYear()
                                    : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button
                                onClick={() => navigateMonth('next')}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
                    </div>

                    {/* Content View */}
                    <div className="flex-1 overflow-hidden relative">
                        {(viewMode === 'day' || viewMode === 'week') && (
                            <CalendarGrid
                                tasks={filteredTasks}
                                currentDate={currentDate}
                                viewMode={viewMode}
                                onDateSelect={handleDateSelect}
                                onTaskUpdate={updateTask}
                                onTaskDelete={deleteTask}
                            />
                        )}
                        {viewMode === 'month' && (
                            <MonthView
                                currentDate={currentDate}
                                tasks={filteredTasks}
                                onDateSelect={handleDateSelect}
                            />
                        )}
                        {viewMode === 'year' && (
                            <YearView
                                currentDate={currentDate}
                                tasks={filteredTasks}
                                onMonthSelect={(date) => {
                                    setCurrentDate(date);
                                    setViewMode('month');
                                }}
                            />
                        )}
                    </div>
                </main>
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                categories={dynamicCategories}
                onSave={(title, duration, startTime, tag, description, isCompleted, actualDuration) => {
                    const tagColor = dynamicCategories.find(c => c.id === tag)?.color || '#3b82f6';
                    const endTime = new Date(startTime);
                    endTime.setMinutes(endTime.getMinutes() + duration);
                    const clientId = window.crypto.randomUUID();

                    addTask({
                        id: clientId,
                        taskClientId: clientId, // Same ID for WebSocket matching before fetch
                        title,
                        description,
                        tagNames: [tag],
                        startTime,
                        endTime,
                        duration,
                        color: tagColor,
                        isCompleted,
                        estimatedTime: duration,
                        actualDuration,
                        recurrence: undefined,
                        aiEstimationStatus: 'loading'
                    }, socketId);
                    setIsCreateModalOpen(false);
                }}
            />

            {/* Drag Overlay */}
            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                    <div style={{ width: '200px' }}>
                        <SmoothDraggableTask task={activeTask} isOverlay />
                    </div>
                ) : activeTemplate ? (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-2xl w-64 ring-2 ring-blue-500/50 backdrop-blur-xl">
                        <div className="flex items-center gap-300">
                            <div
                                className="w-2 h-8 rounded-full"
                                style={{ backgroundColor: activeTemplate.color }}
                            />
                            <div className="flex-1">
                                <h3 className="font-medium text-white">{activeTemplate.title}</h3>
                                <p className="text-xs text-white/60">
                                    {activeTemplate.duration} min • {activeTemplate.category}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

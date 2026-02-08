<<<<<<< HEAD
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { type Task, CATEGORIES, type CategoryId } from '../../types/calendar';
import { TASK_TEMPLATES, type TaskTemplate } from '../../data/templates';
import { Plus, GripVertical, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
=======
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Clock, Tag } from 'lucide-react';
import { TEMPLATES } from '../../data/templates';
import { SidebarTemplateItem } from './SidebarTemplateItem';
import { CATEGORIES } from '../../types/calendarTypes';
import type { CategoryId, Task } from '../../types/calendarTypes';
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
import { cn } from '../../lib/utils';

interface TaskSidebarProps {
    recentTasks: Task[];
<<<<<<< HEAD
    onOpenCreateModal: () => void;
    isOpen: boolean;
    onToggle: () => void;
    filter: CategoryId | 'all';
    onFilterChange: (filter: CategoryId | 'all') => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
    recentTasks,
    onOpenCreateModal,
    isOpen,
    onToggle,
    filter,
    onFilterChange
}) => {
    return (
        <motion.aside
            animate={{ width: isOpen ? 320 : 70, opacity: 1 }}
            className={cn(
                "flex flex-col gap-6 p-4 glass-panel rounded-2xl h-full overflow-hidden relative transition-all duration-300",
                !isOpen && "p-2 items-center"
            )}
        >
            {/* Toggle Button - Square with Arrow */}
            <button
                onClick={onToggle}
                className={cn(
                    "absolute top-6 w-8 h-8 bg-slate-800 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50 cursor-pointer shadow-lg",
                    isOpen ? "-right-4" : "-right-4"
                )}
            >
                {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {/* Content Container */}
            <div className={cn("flex flex-col h-full gap-6", !isOpen && "items-center w-full")}>

                {/* Templates Section */}
                <div className="flex-shrink-0 flex flex-col overflow-hidden max-h-[40%] w-full">
                    {isOpen ? (
                        <>
                            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4 flex items-center justify-between px-1">
                                <span>Task Templates</span>
                            </h2>
                            <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide flex-1">
                                {TASK_TEMPLATES.map((template) => (
                                    <DraggableTemplate key={template.id} template={template} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="mt-12 flex flex-col gap-4 items-center w-full">
                            {/* Icons only for collapsed state could go here if requested, currently empty for cleaner look */}
                        </div>
                    )}
                </div>

                {/* Filter Section */}
                {isOpen && (
                    <div className="flex-shrink-0 w-full px-1">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <Filter className="w-4 h-4" />
                            <span className="text-xs uppercase font-bold tracking-wider">Filter View</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <FilterChip
                                label="All"
                                active={filter === 'all'}
                                onClick={() => onFilterChange('all')}
                            />
                            {CATEGORIES.map(cat => (
                                <FilterChip
                                    key={cat.id}
                                    label={cat.label}
                                    color={cat.color}
                                    active={filter === cat.id}
                                    onClick={() => onFilterChange(cat.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}


                {/* Recent Tasks */}
                <div className="flex-1 overflow-hidden flex flex-col w-full">
                    {isOpen && <h2 className="text-lg font-semibold text-slate-300 mb-4 px-1">Recent Tasks</h2>}
                    <div className={cn("flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide w-full", !isOpen && "hidden")}>
                        {recentTasks.map((task) => (
                            <div key={task.id} className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                                <div className="font-medium text-slate-200">{task.title}</div>
                                <div className="flex justify-between mt-2 text-xs text-slate-500">
                                    <span>{task.category}</span>
                                    <span>{task.duration}m</span>
                                </div>
                            </div>
                        ))}
                        {recentTasks.length === 0 && (
                            <div className="text-sm text-slate-600 text-center py-4">
                                No recent tasks
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Add Button */}
                {isOpen ? (
                    <button
                        onClick={onOpenCreateModal}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center justify-center gap-2 mt-auto shadow-lg shadow-blue-900/20"
                    >
                        <Plus className="w-5 h-5" />
                        Quick Add Task
                    </button>
                ) : (
                    <button
                        onClick={onOpenCreateModal}
                        className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center mt-auto mb-4 shadow-lg shadow-blue-900/20"
                        title="Quick Add"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>
        </motion.aside>
    );
};

// Helper Components

const FilterChip = ({ label, active, onClick, color }: { label: string, active: boolean, onClick: () => void, color?: string }) => (
    <button
        onClick={onClick}
        className={cn(
            "px-2 py-1 rounded-md text-xs font-medium transition-all border",
            active
                ? "bg-white/10 text-white border-white/20"
                : "bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-300"
        )}
        style={active && color ? { borderColor: color, color: color, backgroundColor: `${color}20` } : {}}
    >
        {label}
    </button>
);

const DraggableTemplate = ({ template }: { template: TaskTemplate }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: template.id,
        data: {
            type: 'template',
            template,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing group shadow-md"
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: template.color }}
                />
                <div className="flex-1">
                    <h3 className="font-medium text-slate-200 group-hover:text-white transition-colors">
                        {template.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                        {template.duration} min • {template.category}
                    </p>
                </div>
                <GripVertical className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
            </div>
        </div>
=======
    onCreateTask: (title: string, duration: number, category: CategoryId) => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({ recentTasks, onCreateTask }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60);
    const [category, setCategory] = useState<CategoryId>('work');

    // Load collapse state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved !== null) {
            setIsCollapsed(saved === 'true');
        }
    }, []);

    // Save collapse state to localStorage
    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', String(newState));
    };

    const handleCreateTask = () => {
        if (title.trim()) {
            onCreateTask(title, duration, category);
            setTitle('');
            setDuration(60);
            setCategory('work');
            setShowQuickAdd(false);
        }
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 60 : 280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0 h-full glass-panel rounded-2xl overflow-hidden relative"
        >
            {/* Collapse Toggle */}
            <button
                onClick={toggleCollapse}
                className="absolute top-4 right-2 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
                {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                ) : (
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                )}
            </button>

            <AnimatePresence mode="wait">
                {isCollapsed ? (
                    // Collapsed View
                    <motion.div
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center pt-16 gap-4"
                    >
                        <button
                            onClick={() => {
                                setIsCollapsed(false);
                                setShowQuickAdd(true);
                            }}
                            className="p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                            title="Create New Task"
                        >
                            <Plus className="w-5 h-5 text-blue-400" />
                        </button>
                    </motion.div>
                ) : (
                    // Expanded View
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col p-4 pt-14 overflow-hidden"
                    >
                        {/* Create New Task Button */}
                        <button
                            onClick={() => setShowQuickAdd(!showQuickAdd)}
                            className={cn(
                                "w-full p-3 rounded-lg flex items-center justify-center gap-2",
                                "font-semibold text-sm transition-all",
                                showQuickAdd
                                    ? "bg-blue-500/30 text-blue-300"
                                    : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                            )}
                        >
                            <Plus className="w-4 h-4" />
                            Create New Task
                        </button>

                        {/* Quick Add Form */}
                        <AnimatePresence>
                            {showQuickAdd && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Task title..."
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />

                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-xs text-slate-400 mb-1 block">
                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                    Duration
                                                </label>
                                                <select
                                                    value={duration}
                                                    onChange={(e) => setDuration(Number(e.target.value))}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                >
                                                    <option value={15}>15 min</option>
                                                    <option value={30}>30 min</option>
                                                    <option value={45}>45 min</option>
                                                    <option value={60}>1 hour</option>
                                                    <option value={90}>1.5 hours</option>
                                                    <option value={120}>2 hours</option>
                                                </select>
                                            </div>

                                            <div className="flex-1">
                                                <label className="text-xs text-slate-400 mb-1 block">
                                                    <Tag className="w-3 h-3 inline mr-1" />
                                                    Category
                                                </label>
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value as CategoryId)}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                >
                                                    {CATEGORIES.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCreateTask}
                                            disabled={!title.trim()}
                                            className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-sm transition-colors"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Templates Section */}
                        <div className="mt-6 flex-1 overflow-y-auto">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Templates
                            </h3>
                            <div className="space-y-2">
                                {TEMPLATES.map((template) => (
                                    <SidebarTemplateItem key={template.id} template={template} />
                                ))}
                            </div>

                            {/* Recent Tasks */}
                            {recentTasks.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                        Recent
                                    </h3>
                                    <div className="space-y-2">
                                        {recentTasks.slice(0, 5).map((task) => (
                                            <div
                                                key={task.id}
                                                className="p-2 rounded-lg bg-white/5 border border-white/10"
                                            >
                                                <div className="text-xs font-medium text-white truncate">
                                                    {task.title}
                                                </div>
                                                <div className="text-[10px] text-white/60 mt-0.5">
                                                    {task.duration} min
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
    );
};

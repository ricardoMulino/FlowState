import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { type Task, type Category } from '../../types/calendarTypes';
import { TASK_TEMPLATES, type TaskTemplate } from '../../data/templates';
import { Plus, GripVertical, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TaskSidebarProps {
    recentTasks: Task[];
    onOpenCreateModal: () => void;
    isOpen: boolean;
    onToggle: () => void;
    filter: string | 'all';
    onFilterChange: (filter: string | 'all') => void;
    categories: Category[];
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
    recentTasks,
    onOpenCreateModal,
    isOpen,
    onToggle,
    filter,
    onFilterChange,
    categories
}) => {
    const [isFilterExpanded, setIsFilterExpanded] = React.useState(false);

    return (
        <motion.aside
            animate={{ width: isOpen ? 320 : 70 }}
            className={cn(
                "relative h-full transition-all duration-300 z-40",
                !isOpen && "items-center"
            )}
        >
            {/* Toggle Button - Square with Arrow */}
            <button
                onClick={onToggle}
                className={cn(
                    "absolute top-6 -right-4 w-8 h-8 bg-slate-800 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-[60] cursor-pointer shadow-lg"
                )}
            >
                {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {/* Main Sidebar Container with Glass effect */}
            <div className={cn(
                "flex flex-col gap-6 p-4 glass-panel rounded-2xl h-full w-full overflow-hidden border border-white/10",
                !isOpen && "p-2 items-center"
            )}>
                {/* Content Container */}
                <div className={cn("flex flex-col h-full gap-4", !isOpen && "items-center w-full")}>

                    {/* Filter Section - Moved to Top */}
                    <div className="flex-shrink-0 w-full px-1 z-10 transition-all duration-300">
                        {/* Filter Header / Toggle */}
                        <div className={cn("flex items-center gap-2 mb-2", !isOpen && "justify-center")}>
                            <button
                                onClick={() => {
                                    if (!isOpen) onToggle();
                                    setIsFilterExpanded(!isFilterExpanded);
                                }}
                                className={cn(
                                    "p-2 rounded-lg transition-colors flex items-center gap-2 text-slate-400 hover:text-white",
                                    (isFilterExpanded && isOpen) ? "bg-white/10 text-white" : "hover:bg-white/5"
                                )}
                                title={!isOpen ? "Expand to Filter" : "Toggle Filters"}
                            >
                                <Filter className="w-4 h-4" />
                                {isOpen && (
                                    <>
                                        <span className="text-xs font-bold uppercase tracking-wider">Filters</span>
                                        <motion.div animate={{ rotate: isFilterExpanded ? 180 : 0 }}>
                                            <ChevronRight className="w-3 h-3" />
                                        </motion.div>
                                    </>
                                )}
                            </button>
                        </div>

                        {isOpen && (
                            <motion.div
                                initial={false}
                                animate={{
                                    height: isFilterExpanded ? 'auto' : 0,
                                    opacity: isFilterExpanded ? 1 : 0,
                                    marginBottom: isFilterExpanded ? 12 : 0
                                }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-wrap gap-2 pb-2 pl-1">
                                    <FilterChip
                                        label="All"
                                        active={filter === 'all'}
                                        onClick={() => onFilterChange('all')}
                                    />
                                    {categories.map((cat) => (
                                        <FilterChip
                                            key={cat.id}
                                            label={cat.label}
                                            color={cat.color}
                                            active={filter === cat.id}
                                            onClick={() => onFilterChange(cat.id)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Templates Section */}
                    <div className="flex-shrink-0 flex flex-col overflow-hidden max-h-[45%] w-full">
                        {isOpen ? (
                            <>
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4 flex items-center justify-between px-1">
                                    <span>Task Templates</span>
                                </h2>
                                <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide flex-1">
                                    {TASK_TEMPLATES.map((template) => (
                                        <DraggableTemplate key={template.id} template={template} showLabel={true} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 items-center w-full pt-4 overflow-y-auto scrollbar-hide">
                                {TASK_TEMPLATES.map((template) => (
                                    <DraggableTemplate key={template.id} template={template} showLabel={false} />
                                ))}
                            </div>
                        )}
                    </div>


                    {/* Recent Tasks */}
                    <div className="flex-1 overflow-hidden flex flex-col w-full">
                        {isOpen && <h2 className="text-lg font-semibold text-slate-300 mb-4 px-1">Recent Tasks</h2>}
                        <div className={cn("flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide w-full", !isOpen && "flex flex-col items-center pt-4 gap-2")}>
                            {recentTasks.map((task) => (
                                isOpen ? (
                                    <div key={task.id} className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm group hover:border-white/20 transition-colors">
                                        <div className="font-medium text-slate-200">{task.title}</div>
                                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                                            <span style={{ color: task.color }}>{task.tagNames?.[0] || 'no tag'}</span>
                                            <div className="flex items-center gap-1">
                                                {task.aiEstimationStatus === 'loading' && (
                                                    <span className="inline-block animate-pulse text-blue-400 font-bold" title="AI Estimating...">?</span>
                                                )}
                                                {task.aiEstimationStatus === 'success' && task.aiRecommendation === 'keep' && (
                                                    <span className="text-green-400" title={task.aiReasoning || 'AI suggests keeping the time'}>✓</span>
                                                )}
                                                {task.aiEstimationStatus === 'success' && task.aiRecommendation === 'increase' && (
                                                    <span className="text-yellow-400" title={task.aiReasoning || 'AI suggests more time'}>⚠</span>
                                                )}
                                                {task.aiEstimationStatus === 'error' && (
                                                    <span className="text-red-400" title="AI Estimation Failed">❌</span>
                                                )}
                                                <span>{task.duration}m</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        key={task.id}
                                        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer relative group"
                                        style={{ backgroundColor: `${task.color}20`, borderColor: task.color }}
                                        title={task.title}
                                    >
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: task.color }} />
                                    </div>
                                )
                            ))}
                            {recentTasks.length === 0 && (
                                <div className="text-sm text-slate-600 text-center py-4">
                                    {isOpen ? "No recent tasks" : "-"}
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

const DraggableTemplate = ({ template, showLabel = true }: { template: TaskTemplate, showLabel?: boolean }) => {
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

    if (!showLabel) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing group shadow-md flex items-center justify-center"
                title={template.title}
            >
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: template.color }}
                />
            </div>
        );
    }

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
    );
};

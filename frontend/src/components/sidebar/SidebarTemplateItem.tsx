import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { TaskTemplate } from '../../data/templates';
import { cn } from '../../lib/utils';

interface SidebarTemplateItemProps {
    template: TaskTemplate;
}

export const SidebarTemplateItem: React.FC<SidebarTemplateItemProps> = ({ template }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: template.id,
        data: {
            type: 'template',
            template
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        backgroundColor: `${template.color}15`
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
                "p-3 rounded-lg cursor-grab active:cursor-grabbing",
                "border border-white/10 backdrop-blur-md",
                "transition-all duration-150",
                isDragging ? "opacity-50 scale-95" : "hover:scale-[1.02] hover:border-white/20"
            )}
            style={style}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                        {template.title}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
                        {template.duration} min
                    </div>
                </div>
                <div
                    className="w-3 h-3 rounded-full ml-2 flex-shrink-0"
                    style={{ backgroundColor: template.color }}
                />
            </div>
        </div>
    );
};

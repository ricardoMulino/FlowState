import { useState, useEffect } from 'react';
// import { useAuth } from './contexts/AuthContext';
import { useCalendar } from './contexts/CalendarContext';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from './lib/utils';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function Dash() {
    // const { email } = useAuth(); // Not needed if tasks come from context (which has auth)
    const { currentDate, tasks, timeZone, setTimeZone } = useCalendar();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Filter tasks for today
    const todaysTasks = tasks.filter(task => isSameDay(task.startTime, currentDate))
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return (
        <div className="h-full p-6 overflow-hidden flex flex-col gap-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent shrink-0">
                Dashboard
            </h1>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* LEFT COLUMN (40%) */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 min-h-0">

                    {/* Top Left: Mini Monthly Calendar */}
                    <div className="flex-[1.5] glass-panel rounded-3xl p-6 overflow-hidden flex flex-col relative group hover:border-blue-500/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h2 className="text-lg font-semibold text-slate-200 mb-4 z-10 flex items-center justify-between">
                            <span>{format(currentDate, 'MMMM yyyy')}</span>
                            <span className="text-xs font-normal text-slate-500 bg-white/5 px-2 py-1 rounded-full">Mini View</span>
                        </h2>
                        <div className="flex-1 z-10">
                            <MiniCalendar currentDate={currentDate} tasks={tasks} />
                        </div>
                    </div>

                    {/* Bottom Row Helper */}
                    <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">

                        {/* Bottom Left: Task Bubbles */}
                        <div className="glass-panel rounded-3xl p-5 relative group hover:border-purple-500/30 transition-colors flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                            <h3 className="text-sm font-medium text-slate-400 mb-3 z-10">Task Distribution</h3>
                            <div className="flex-1 overflow-auto scrollbar-hide flex flex-wrap content-start gap-2 z-10">
                                {todaysTasks.length > 0 ? (
                                    todaysTasks.map(task => (
                                        <div
                                            key={task.id}
                                            className="w-10 h-10 rounded-full border border-white/10 shadow-lg hover:scale-110 transition-transform cursor-help flex items-center justify-center text-xs font-bold text-white/90 select-none"
                                            style={{ backgroundColor: task.color, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                                            title={`${task.title} (${task.duration}m)`}
                                        >
                                            {task.title.charAt(0).toUpperCase()}
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-600 italic">
                                        No tasks today
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Right: FloPad */}
                        <div className="glass-panel rounded-3xl p-5 relative group hover:border-emerald-500/30 transition-colors flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                            <h3 className="text-sm font-medium text-slate-400 mb-2 z-10">FloPad</h3>
                            <textarea
                                className="flex-1 w-full bg-transparent resize-none border border-transparent focus:border-blue-500/30 focus:bg-white/5 focus:ring-1 focus:ring-blue-500/30 rounded-xl p-3 text-sm text-slate-300 placeholder:text-slate-600 leading-relaxed z-10 scrollbar-hide transition-all duration-300"
                                placeholder="Daily goals, quotes, or thoughts..."
                                spellCheck={false}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (60%) */}
                <div className="col-span-12 lg:col-span-7 glass-panel rounded-3xl p-8 overflow-hidden flex flex-col relative group hover:border-blue-500/30 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex items-center justify-between mb-8 z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Daily Itinerary</h2>
                            <p className="text-slate-400 text-sm">{format(currentDate, 'EEEE, MMMM do')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white font-mono tracking-wider tabular-nums">
                                    {now.toLocaleTimeString('en-US', { timeZone, hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <div className="text-xs text-emerald-400 font-medium tracking-wide">LIVE</div>
                                    <span className="text-white/30">•</span>
                                    <select
                                        value={timeZone}
                                        onChange={(e) => setTimeZone(e.target.value)}
                                        className="bg-transparent text-xs text-slate-400 border-none outline-none focus:ring-0 cursor-pointer hover:text-white transition-colors text-right appearance-none"
                                        title="Change Timezone"
                                    >
                                        {[
                                            'UTC',
                                            'America/New_York',
                                            'America/Chicago',
                                            'America/Denver',
                                            'America/Los_Angeles',
                                            'Europe/London',
                                            'Europe/Paris',
                                            'Asia/Tokyo',
                                            'Australia/Sydney'
                                        ].map(tz => (
                                            <option key={tz} value={tz} className="bg-slate-900 text-slate-200">
                                                {tz.replace(/_/g, ' ')}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-6 z-10">
                        {todaysTasks.length > 0 ? (
                            todaysTasks.map((task, index) => (
                                <div key={task.id} className="relative pl-8 group/item">
                                    {/* Timeline Line */}
                                    {index !== todaysTasks.length - 1 && (
                                        <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-white/5 group-hover/item:bg-white/10 transition-colors" />
                                    )}

                                    {/* Timeline Dot */}
                                    <div
                                        className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-slate-950 shadow-sm flex items-center justify-center transition-transform group-hover/item:scale-110"
                                        style={{ backgroundColor: task.color }}
                                    >
                                        {task.isCompleted && <CheckCircle2 className="w-3 h-3 text-slate-900" />}
                                    </div>

                                    {/* Content Card */}
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group-hover/item:translate-x-1">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-semibold text-slate-200 text-lg mb-1">{task.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                                                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300" style={{ color: task.color, borderColor: `${task.color}30`, backgroundColor: `${task.color}10` }}>
                                                        {task.tagNames?.[0]}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{format(task.startTime, 'h:mm a')} - {format(task.endTime, 'h:mm a')}</span>
                                                    <span>•</span>
                                                    <span>{task.duration} min</span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 group-hover/item:line-clamp-none transition-all">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>
                                            {task.actualDuration && (
                                                <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                                                    Done in {task.actualDuration}m
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                                <AlertCircle className="w-8 h-8 mb-3 opacity-50" />
                                <p>No tasks scheduled for today.</p>
                                <p className="text-sm opacity-60">Enjoy your free time!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Mini Calendar Component
const MiniCalendar = ({ currentDate, tasks }: { currentDate: Date, tasks: any[] }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-7 mb-2">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-600">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-1 content-start">
                {days.map(day => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const dayTasks = tasks.filter(t => isSameDay(t.startTime, day));
                    const isTodayDate = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all",
                                !isCurrentMonth && "opacity-20",
                                isTodayDate ? "bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30" : "hover:bg-white/5 text-slate-400"
                            )}
                        >
                            <span className="text-xs mb-0.5">{day.getDate()}</span>
                            <div className="flex gap-0.5 px-0.5 justify-center w-full flex-wrap">
                                {dayTasks.slice(0, 3).map(t => (
                                    <div
                                        key={t.id}
                                        className="w-1 h-1 rounded-full"
                                        style={{ backgroundColor: t.color }}
                                    />
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="w-1 h-1 rounded-full bg-slate-600" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

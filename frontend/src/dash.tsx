import { useState, useEffect } from 'react';
import { useCalendar } from './contexts/CalendarContext';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { useFlowpad } from './hooks/useFlowpad';
import { cn } from './lib/utils';
import { AlertCircle, CheckCircle2, Clock, TrendingUp, TrendingDown } from 'lucide-react';

export default function Dash() {
    const { tasks, timeZone } = useCalendar();
    const [now, setNow] = useState(new Date());
    const { content, updateContent, isLoading } = useFlowpad();

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Filter tasks for today
    const todaysTasks = tasks.filter(task => isSameDay(task.startTime, now))
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
                    <div className="flex-[1.5] glass-panel rounded-3xl p-6 overflow-hidden flex flex-col relative group hover:border-blue-500/30 transition-colors min-h-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h2 className="text-lg font-semibold text-slate-200 mb-4 z-10 flex items-center justify-between">
                            <span>{format(now, 'MMMM yyyy')}</span>
                            <span className="text-xs font-normal text-slate-500 bg-white/5 px-2 py-1 rounded-full">Mini View</span>
                        </h2>
                        <div className="flex-1 z-10 min-h-0 w-full">
                            <MiniCalendar currentDate={now} tasks={tasks} />
                        </div>
                    </div>

                    {/* Bottom Row Helper */}
                    <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">

                        {/* Bottom Left: Market Trends */}
                        <div className="glass-panel rounded-3xl p-5 relative group hover:border-indigo-500/30 transition-colors flex flex-col min-h-0">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                            <h3 className="text-sm font-medium text-slate-400 mb-0 z-10">Market Trends</h3>
                            <div className="flex-1 overflow-auto scrollbar-hide flex flex-col z-10 mt-2">
                                <MarketTrends />
                            </div>
                        </div>

                        {/* Bottom Right: FloPad */}
                        <div className="glass-panel rounded-3xl p-5 relative group hover:border-emerald-500/30 transition-colors flex flex-col min-h-0">
                            <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                            <h3 className="text-sm font-medium text-slate-400 mb-2 z-10 flex justify-between items-center">
                                <span>FloPad</span>
                                {isLoading && <span className="text-[10px] text-emerald-400 animate-pulse">Syncing...</span>}
                            </h3>
                            <textarea
                                value={content}
                                onChange={(e) => updateContent(e.target.value)}
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
                            <p className="text-slate-400 text-sm">{format(now, 'EEEE, MMMM do')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white font-mono tracking-wider tabular-nums">
                                    {now.toLocaleTimeString(undefined, { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                    <div className="text-xs text-emerald-400 font-medium tracking-wide">LIVE</div>
                                    <span className="text-white/30">•</span>
                                    <div className="text-xs text-slate-400 font-medium tracking-wide">Local Time</div>
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

// Market Trends Component
const MarketTrends = () => {
    const [trends, setTrends] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchStocks = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
            const response = await fetch(`${apiBase}/stocks`);
            if (!response.ok) throw new Error('Failed to fetch stocks');
            const data = await response.json();
            setTrends(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching stocks:', err);
            setError('Offline');
        }
    };

    useEffect(() => {
        fetchStocks();
        const interval = setInterval(fetchStocks, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (error && trends.length === 0) {
        return <div className="text-xs text-rose-400 p-2 italic">Market data unavailable</div>;
    }

    if (trends.length === 0) {
        return (
            <div className="flex flex-col gap-2 w-full animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl border border-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 w-full pr-1 pb-1">
            {trends.map(t => {
                const isPositive = t.change >= 0;
                return (
                    <div key={t.symbol} className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors cursor-default group/ticker">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-200 leading-none">{t.symbol}</span>
                                <span className="text-[10px] text-slate-500 truncate w-16 leading-tight mt-0.5">{t.name}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-mono text-slate-200 leading-none">${t.price.toFixed(2)}</span>
                            <span className={`text-[10px] font-mono font-medium mt-0.5 leading-tight ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPositive ? '+' : ''}{t.change.toFixed(2)} ({isPositive ? '+' : ''}{t.percent.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Mini Calendar Component
const MiniCalendar = ({ currentDate, tasks }: { currentDate: Date, tasks: any[] }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="flex flex-col w-full h-full">
            <div className="grid grid-cols-7 mb-2 shrink-0">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-600">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr min-h-0 pb-1">
                {days.map(day => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const dayTasks = tasks.filter(t => isSameDay(t.startTime, day));
                    const isTodayDate = isToday(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "rounded-lg flex flex-col items-center justify-center relative transition-all min-h-0 py-0.5",
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

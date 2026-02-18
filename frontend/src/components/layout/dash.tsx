import { useState, useEffect } from 'react';
import { useCalendar } from '../../contexts/CalendarContext';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '../../lib/utils';
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
        <div >
            <h1>
                Dashboard
            </h1>

            <div>
                <div>

                    {/* Top Left: Mini Monthly Calendar */}
                    <div>
                        <div>
                            <span>{format(currentDate, 'MMMM yyyy')}</span>
                            <span>Mini View</span><h2>
                            </h2>
                            <div>
                                {/*<MiniCalendar currentDate={currentDate} tasks={tasks} />*/}
                            </div>
                        </div>

                        {/* Bottom Row Helper */}
                        <div>

                            {/* Bottom Left: Task Bubbles */}
                            <div>
                                <div>
                                </div><h3>Task Distribution</h3>
                                <div>
                                    {todaysTasks.length > 0 ? (
                                        todaysTasks.map(task => (
                                            <div
                                                key={task.id}
                                                style={{ backgroundColor: task.color, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                                                title={`${task.title} (${task.duration}m)`}
                                            >
                                                {task.title.charAt(0).toUpperCase()}
                                            </div>
                                        ))
                                    ) : (
                                        <div>
                                            No tasks today
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bottom Right: FloPad */}
                            <div>
                                <div>
                                </div><h3>FloPad</h3>
                                <textarea
                                    placeholder="Daily goals, quotes, or thoughts..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (60%) */}
                    <div>
                        <div />

                        <div>
                            <div>
                                <h2>Daily Itinerary</h2>
                                <p>{format(currentDate, 'EEEE, MMMM do')}</p>
                            </div>
                            <div>
                                <div>
                                    <div>
                                        {now.toLocaleTimeString('en-US', { timeZone, hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                    <div>
                                        <div>LIVE</div>
                                        <span>•</span>
                                        <select
                                            value={timeZone}
                                            onChange={(e) => setTimeZone(e.target.value)}
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
                                <div>
                                    <Clock />
                                </div>
                            </div>
                        </div>

                        <div>
                            {todaysTasks.length > 0 ? (
                                todaysTasks.map((task, index) => (
                                    <div key={task.id}>
                                        {index !== todaysTasks.length - 1 && (
                                            <div />
                                        )}

                                        <div>
                                            {task.isCompleted && <CheckCircle2 />}
                                        </div>

                                        <div>
                                            <div>
                                                <div>
                                                    <h3>{task.title}</h3>
                                                    <div>
                                                        <span>
                                                            {task.tagNames?.[0]}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{format(task.startTime, 'h:mm a')} - {format(task.endTime, 'h:mm a')}</span>
                                                        <span>•</span>
                                                        <span>{task.duration} min</span>
                                                    </div>
                                                    {task.description && (
                                                        <p>
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>
                                                {task.actualDuration && (
                                                    <div>
                                                        Done in {task.actualDuration}m
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div>
                                    <AlertCircle />
                                    <p>No tasks scheduled for today.</p>
                                    <p>Enjoy your free time!</p>
                                </div>
                            )}
                        </div>
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
        <div>
            <div>
                {weekDays.map(d => (
                    <div key={d}>{d}</div>
                ))}
            </div>
            <div>
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

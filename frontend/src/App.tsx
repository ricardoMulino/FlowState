```typescript
import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CalendarGrid } from './components/calendar/CalendarGrid';
import { TaskSidebar } from './components/sidebar/TaskSidebar';
import { MOCK_TASKS } from './data/mock-tasks';
import type { Task, CategoryId } from './types/calendarTypes';
import { CATEGORIES } from './types/calendarTypes';
import type { TaskTemplate } from './data/templates';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const handleTaskMove = useCallback((taskId: string, newStartTime: Date, newCategory: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const duration = task.duration;
        const newEndTime = new Date(newStartTime);
        newEndTime.setMinutes(newEndTime.getMinutes() + duration);

        return {
          ...task,
          startTime: newStartTime,
          endTime: newEndTime,
          category: newCategory as CategoryId
        };
      }
      return task;
    }));
  }, []);

  const handleCreateTask = useCallback((title: string, duration: number, category: CategoryId) => {
    const categoryColor = CATEGORIES.find(c => c.id === category)?.color || '#3b82f6';
    const now = new Date();
    now.setHours(9, 0, 0, 0); // Default to 9 AM today

    const endTime = new Date(now);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const newTask: Task = {
      id: `task - ${ Date.now() } `,
      title,
      category,
      startTime: now,
      endTime,
      duration,
      color: categoryColor,
      isCompleted: false,
      estimatedTime: duration,
    };

    setTasks(prev => [...prev, newTask]);
  }, []);

  const handleTaskCreateFromTemplate = useCallback((template: TaskTemplate, startTime: Date, category: string) => {
    const newTask: Task = {
      id: `task - ${ Date.now() } `,
      title: template.title,
      category: category as CategoryId,
      startTime,
      endTime: new Date(startTime.getTime() + template.duration * 60000),
      duration: template.duration,
      color: template.color,
      isCompleted: false,
      estimatedTime: template.duration,
    };

    setTasks(prev => [...prev, newTask]);
  }, []);

  // Get recent tasks (sorted by creation, most recent first)
  const recentTasks = [...tasks]
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, 5);
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto p-4 flex flex-col h-screen overflow-hidden">
        <Header />
<<<<<<< HEAD

        {isDashboard ? (
          <Dashboard />
        ) : (
          <main className="flex-1 mt-4 overflow-hidden relative glass-panel rounded-2xl">
            <Outlet />
          </main>
        )}
=======
<<<<<<< HEAD
        <div className="flex-1 mt-4 flex gap-4 overflow-hidden">
          <TaskSidebar recentTasks={recentTasks} onCreateTask={handleCreateTask} />
          <main className="flex-1 overflow-hidden relative glass-panel rounded-2xl">
            <CalendarGrid tasks={tasks} onTaskMove={handleTaskMove} onTaskCreate={handleTaskCreateFromTemplate} />
          </main>
        </div>
=======
        <main className="flex-1 mt-4 overflow-hidden relative glass-panel rounded-2xl">
          {/*<CalendarGrid />*/}
          <Outlet />
        </main>
>>>>>>> abeb5dfc8d77bb1c827f249bf92a96dfb9e7dad3
>>>>>>> 560bff67bf4145cad71b28c106f01a9f8777c7b1
      </div>
    </div>
  );
}

export default App;

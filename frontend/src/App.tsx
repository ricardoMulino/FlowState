import React from 'react';
import Header from './components/layout/Header';
import CalendarGrid from './components/calendar/CalendarGrid';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto p-4 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 mt-4 overflow-hidden relative glass-panel rounded-2xl">
          <CalendarGrid />
        </main>
      </div>
    </div>
  );
}

export default App;

import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { useSettingsContext } from './contexts/SettingsContext';

function App() {
  const { isDarkMode } = useSettingsContext();

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'dark bg-background text-foreground' : 'bg-background text-foreground'
    }`}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;

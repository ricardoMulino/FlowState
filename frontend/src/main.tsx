import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './pages/App.tsx'
import { Landing } from './pages/landing.tsx'
import { AuthPage } from './pages/login.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { Tags } from './pages/tags.tsx'
import { Tasks } from './pages/tasks.tsx'
import { Settings } from './pages/settings.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
    ],
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
  {
    path: "/dash",
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "/tags",
    element: <Tags />,
  },
  {
    path: "/tasks",
    element: <Tasks />,
  },
  {
    path: "/settings",
    element: <Settings />,
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)

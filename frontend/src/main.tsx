import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Landing from './landing.tsx'

import AuthPage from './login.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { CalendarProvider } from './contexts/CalendarContext.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'

import { Dashboard } from './pages/Dashboard.tsx'
import { Tags } from './pages/Tags.tsx'
import Dash from './dash.tsx'
import Tasks from './tasks.tsx'
import Settings from './settingMenu.tsx'

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
    path: "/calendar",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "/tags",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Tags />,
      },
    ],
  },
  {
    path: "/dash",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dash />,
      },
    ],
  },
  {
    path: "/tasks",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Tasks />,
      },
    ],
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Settings />,
      },
    ],
  }
]);

import { WebSocketProvider } from './contexts/WebSocketContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <CalendarProvider>
          <RouterProvider router={router} />
        </CalendarProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

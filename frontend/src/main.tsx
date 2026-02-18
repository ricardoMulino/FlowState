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
import { WebSocketProvider } from './contexts/WebSocketContext.tsx'

import { Calendar } from './pages/Calendar.tsx'
import { Tags } from './pages/Tags.tsx'
import Dash from './dash.tsx'
import Settings from './settingMenu.tsx'
import { Flow } from './pages/Flow.tsx'

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
        element: <Calendar />,
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
  },
  {
    path: "/flow",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Flow />,
      },
    ],
  }
]);



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <WebSocketProvider>
          <CalendarProvider>
            <RouterProvider router={router} />
          </CalendarProvider>
        </WebSocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)

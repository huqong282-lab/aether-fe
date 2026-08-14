import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { AppPage } from './pages/app/AppPage'
import { ServerWorkspacePage } from './pages/app/server/ServerWorkspacePage'
import { ServerSettingsPage } from './pages/app/server/ServerSettingsPage'
import { UserSettingsPage } from './pages/settings/UserSettingsPage'
import { useAuthStore } from './state/auth.state'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/servers/:serverId"
        element={
          <ProtectedRoute>
            <ServerWorkspacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/servers/:serverId/channels/:channelId"
        element={
          <ProtectedRoute>
            <ServerWorkspacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/servers/:serverId/settings"
        element={
          <ProtectedRoute>
            <ServerSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRoute>
            <UserSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

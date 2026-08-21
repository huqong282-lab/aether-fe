import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { AppPage } from './pages/app/AppPage'
import { ServerWorkspacePage } from './pages/app/server/ServerWorkspacePage'
import { ServerSettingsPage } from './pages/app/server/ServerSettingsPage'
import { UserSettingsPage } from './pages/settings/UserSettingsPage'
import { NotificationCenter } from './components/notifications/NotificationCenter'
import { RealtimeConnectionProvider } from './lib/websocket'
import { useAuthStore } from './state/auth.state'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

function ProtectedRealtimeRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <RealtimeConnectionProvider>
        <>
          {children}
          <NotificationCenter />
        </>
      </RealtimeConnectionProvider>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRealtimeRoute>
            <AppPage />
          </ProtectedRealtimeRoute>
        }
      />
      <Route
        path="/app/servers/:serverId"
        element={
          <ProtectedRealtimeRoute>
            <ServerWorkspacePage />
          </ProtectedRealtimeRoute>
        }
      />
      <Route
        path="/app/servers/:serverId/channels/:channelId"
        element={
          <ProtectedRealtimeRoute>
            <ServerWorkspacePage />
          </ProtectedRealtimeRoute>
        }
      />
      <Route
        path="/app/servers/:serverId/settings"
        element={
          <ProtectedRealtimeRoute>
            <ServerSettingsPage />
          </ProtectedRealtimeRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRealtimeRoute>
            <UserSettingsPage />
          </ProtectedRealtimeRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

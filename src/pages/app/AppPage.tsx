import { useState } from 'react'
import { useAuthStore } from '../../state/auth.state'
import { AppCreateServerModal } from './components/AppCreateServerModal'
import { AppMain } from './components/AppMain'
import { AppServerRail } from './components/AppServerRail'
import { AppSidebar } from './components/AppSidebar'
import { AppUserPanel } from './components/AppUserPanel'

export function AppPage() {
  const user = useAuthStore((state) => state.user)
  const [isCreateServerOpen, setIsCreateServerOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#202225] text-white">
      <div className="flex min-h-screen overflow-hidden pb-[104px] md:pb-0">
        <AppServerRail onCreateServerClick={() => setIsCreateServerOpen(true)} />
        <AppSidebar />

        <div className="relative flex min-w-0 flex-1">
          <AppMain />
        </div>
      </div>

      <div className="pointer-events-none fixed left-5 top-5 hidden rounded-full border border-white/[0.08] bg-[#202225]/85 px-4 py-2 text-sm text-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur md:block">
        Login as <span className="font-semibold text-white">{user?.username ?? 'guest'}</span>
      </div>

      <AppCreateServerModal open={isCreateServerOpen} onClose={() => setIsCreateServerOpen(false)} />

      <AppUserPanel variant="mobile" />
    </main>
  )
}

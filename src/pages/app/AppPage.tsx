import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/auth.state'

export function AppPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2244_0%,#08101f_55%,#050816_100%)] px-4 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Aether App</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            Welcome{user?.username ? `, ${user.username}` : ''}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
            Login berhasil. Ini adalah placeholder route `/app` yang akan menjadi entry point
            area utama aplikasi.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-400">Authenticated as</p>
            <p className="mt-1 text-lg font-semibold text-white">{user?.email ?? '-'}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/app/settings')}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Open Settings
            </button>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

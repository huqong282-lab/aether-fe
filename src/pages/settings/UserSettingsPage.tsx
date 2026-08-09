import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../state/auth.state'

type IconProps = {
  className?: string
}

function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1.9 1.9 0 00.38 2.09l.04.04a2.3 2.3 0 11-3.25 3.25l-.04-.04A1.9 1.9 0 0014.44 20h-.08a1.9 1.9 0 00-1.88 1.5 2.3 2.3 0 11-4.45 0A1.9 1.9 0 006.15 20h-.08a1.9 1.9 0 00-2.09.38l-.04.04a2.3 2.3 0 11-3.25-3.25l.04-.04A1.9 1.9 0 001 15.08V14.9a1.9 1.9 0 00-1.5-1.88 2.3 2.3 0 110-4.45A1.9 1.9 0 001 6.15v-.08a1.9 1.9 0 00-.38-2.09l-.04-.04a2.3 2.3 0 113.25-3.25l.04.04A1.9 1.9 0 006.02 1h.08a1.9 1.9 0 001.88-1.5 2.3 2.3 0 014.45 0A1.9 1.9 0 0013.98 1h.08a1.9 1.9 0 002.09-.38l.04-.04a2.3 2.3 0 113.25 3.25l-.04.04A1.9 1.9 0 0019 6.02V6.1a1.9 1.9 0 001.5 1.88 2.3 2.3 0 010 4.45A1.9 1.9 0 0019 13.98V14c0 .34.07.68.2 1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3l7 3v5c0 4.7-3 8.9-7 10-4-1.1-7-5.3-7-10V6l7-3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12l1.8 1.8L15 10.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6 17h12l-1.2-1.5V11a4.8 4.8 0 10-9.6 0v4.5L6 17z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M12 3c2.7 2.6 4 5.6 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.6-4-9s1.3-6.4 4-9z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LayersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 4l8 4-8 4-8-4 8-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 12l8 4 8-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 16l8 4 8-4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

type SectionItem = {
  label: string
  icon: (props: IconProps) => JSX.Element
  active?: boolean
}

const sectionItems: SectionItem[] = [
  { label: 'Account', icon: SettingsIcon, active: true },
  { label: 'Data & Privacy', icon: ShieldIcon },
  { label: 'Messaging Permissions', icon: LockIcon },
  { label: 'Notifications', icon: BellIcon },
  { label: 'Billing', icon: LayersIcon },
  { label: 'Experience', icon: GlobeIcon },
]

function SidebarItem({ label, icon: Icon, active = false }: SectionItem) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? 'bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.2)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  )
}

function SettingsRow({
  label,
  value,
  actionLabel = 'Edit',
}: {
  label: string
  value: string
  actionLabel?: string
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
      </div>
      <div className="text-right text-sm font-semibold text-white">{value}</div>
      <button
        type="button"
        className="min-w-[7.5rem] rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
      >
        {actionLabel}
      </button>
    </div>
  )
}

export function UserSettingsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const emailParts = user?.email?.split('@')
  const maskedEmail =
    emailParts && emailParts.length === 2
      ? `${emailParts[0].slice(0, 2)}******@${emailParts[1]}`
      : '********@gmail.com'

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2244_0%,#08101f_50%,#050816_100%)] p-4 text-white sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1500px] overflow-hidden rounded-[28px] border border-white/10 bg-[#313338] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
        <aside className="hidden w-[320px] shrink-0 border-r border-white/10 bg-[#2b2d31] px-5 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  user?.avatarUrl ??
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80'
                }
                alt="Avatar pengguna"
                className="h-14 w-14 rounded-full border-2 border-fuchsia-400 object-cover shadow-[0_0_0_4px_rgba(236,72,153,0.18)]"
              />
              <span className="absolute -bottom-0.5 right-0 h-4 w-4 rounded-full border-2 border-[#2b2d31] bg-emerald-500" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{user?.username ?? 'Hanz'}</p>
              <p className="text-sm text-slate-400">Edit Profiles</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-[#1f2024] px-4 py-3">
            <div className="flex items-center gap-3 text-slate-300">
              <SearchIcon className="h-4 w-4" />
              <span className="text-sm">Search</span>
            </div>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto pr-1">
            <div className="space-y-1">
              <SidebarItem label="Account" icon={SettingsIcon} active />
              <div className="ml-4 border-l border-white/10 pl-4">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-white"
                >
                  <span className="h-8 w-1 rounded-full bg-white" />
                  <span>Account Info</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-400 hover:text-white"
                >
                  <span className="h-8 w-1 rounded-full bg-transparent" />
                  <span>Password & Security</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-400 hover:text-white"
                >
                  <span className="h-8 w-1 rounded-full bg-transparent" />
                  <span>Account Standing</span>
                </button>
              </div>

              <div className="pt-3">
                {sectionItems.slice(1).map((item) => (
                  <div key={item.label} className="mb-1">
                    <SidebarItem label={item.label} icon={item.icon} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-[#313338]">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Account
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                User Settings
              </h1>
            </div>

            <button
              type="button"
              onClick={() => navigate('/app')}
              className="rounded-full p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close settings"
            >
              <span className="text-2xl leading-none">x</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            <div className="mx-auto max-w-4xl">
              <section className="rounded-3xl border border-white/10 bg-white/5 px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                <div className="mb-8">
                  <p className="text-xl font-semibold tracking-tight text-white sm:text-3xl">
                    Account Info
                  </p>
                </div>

                <SettingsRow label="Username" value={user?.username ?? 'hanz0279'} />
                <SettingsRow label="Email" value={maskedEmail} />
                <SettingsRow label="Phone Number" value="*********6729" />

                <div className="my-8 border-t border-white/10" />

                <div className="mb-2">
                  <p className="text-xl font-semibold tracking-tight text-white sm:text-3xl">
                    Password & Security
                  </p>
                </div>

                <SettingsRow label="Password" value="************" />

                <button
                  type="button"
                  className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 py-4"
                >
                  <span className="text-left text-sm font-medium text-white">
                    Multi-Factor Authentication
                  </span>
                  <span className="text-sm font-semibold text-white">Set up</span>
                  <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                </button>

                <button
                  type="button"
                  className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 py-4"
                >
                  <span className="text-left text-sm font-medium text-white">
                    Logged-in Devices
                  </span>
                  <span className="text-sm font-semibold text-white">2 devices</span>
                  <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                </button>

                <div className="my-8 border-t border-white/10" />

                <div className="mb-2">
                  <p className="text-xl font-semibold tracking-tight text-white sm:text-3xl">
                    Account Standing
                  </p>
                </div>

                <p className="max-w-2xl text-sm leading-6 text-slate-300">
                  Bagian ini disiapkan untuk menampilkan status akun, peringatan keamanan, dan sesi
                  aktif secara detail. Untuk sekarang, kita tampilkan struktur halaman dan akses
                  menuju sub-halaman perangkat.
                </p>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

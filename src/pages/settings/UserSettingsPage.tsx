import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ReactElement } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { normalizeApiError } from '../../lib/api-error'
import { fetchDeviceSessions, revokeDeviceSession, type DeviceSession } from '../../lib/auth/session.api'
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

function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function MonitorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 19h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="7" y="3" width="10" height="18" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function LaptopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="5" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 19h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 7l1 13h6l1-13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type SectionItem = {
  label: string
  icon: (props: IconProps) => ReactElement
  active?: boolean
  onClick?: () => void
}

type ViewMode = 'account' | 'sessions'

const sectionItems: Omit<SectionItem, 'active' | 'onClick'>[] = [
  { label: 'Account', icon: SettingsIcon },
  { label: 'Data & Privacy', icon: ShieldIcon },
  { label: 'Messaging Permissions', icon: LockIcon },
  { label: 'Notifications', icon: BellIcon },
  { label: 'Billing', icon: LayersIcon },
  { label: 'Experience', icon: GlobeIcon },
]

function SidebarItem({ label, icon: Icon, active = false, onClick }: SectionItem) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? 'bg-white/[0.08] text-slate-50 shadow-[0_10px_30px_rgba(0,0,0,0.16)]'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </button>
  )
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatRelativeTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'just now'
  }

  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const absSeconds = Math.abs(diffInSeconds)

  if (absSeconds < 60) {
    return 'just now'
  }

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ]

  for (const [unit, secondsPerUnit] of units) {
    if (absSeconds >= secondsPerUnit) {
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        Math.round(diffInSeconds / secondsPerUnit),
        unit,
      )
    }
  }

  return 'just now'
}

function getDeviceIcon(deviceInfo: string | null) {
  const normalized = deviceInfo?.toLowerCase() ?? ''
  if (/(iphone|android|mobile|ipad)/.test(normalized)) {
    return PhoneIcon
  }

  if (/(macbook|laptop|notebook)/.test(normalized)) {
    return LaptopIcon
  }

  return MonitorIcon
}

function getDeviceLabel(deviceInfo: string | null) {
  const label = deviceInfo?.trim()
  return label && label.length > 0 ? label : 'Unknown device'
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
        <p className="text-sm font-medium text-slate-100">{label}</p>
      </div>
      <div className="text-right text-sm font-semibold text-slate-100">{value}</div>
      <button
        type="button"
        className="min-w-[7.5rem] rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.12]"
      >
        {actionLabel}
      </button>
    </div>
  )
}

function SettingsLinkRow({
  label,
  value,
  onClick,
}: {
  label: string
  value: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 rounded-2xl px-0 py-4 text-left transition hover:bg-white/[0.03]"
    >
      <span className="text-left text-sm font-medium text-slate-100">{label}</span>
      <span className="text-sm font-semibold text-slate-100">{value}</span>
      <ChevronRightIcon className="h-5 w-5 text-slate-500" />
    </button>
  )
}

function DeviceSessionCard({
  session,
  isCurrent,
  onRevoke,
  isRevoking,
}: {
  session: DeviceSession
  isCurrent: boolean
  onRevoke?: (session: DeviceSession) => void
  isRevoking?: boolean
}) {
  const DeviceIcon = getDeviceIcon(session.deviceInfo)
  const loginTimeLabel = formatDateTime(session.createdAt)
  const relativeLabel = formatRelativeTime(session.createdAt)

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border px-5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center sm:justify-between ${
        isCurrent ? 'border-cyan-400/20 bg-cyan-400/[0.05]' : 'border-white/[0.08] bg-white/[0.03]'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            isCurrent ? 'bg-cyan-400/[0.12] text-cyan-200' : 'bg-white/[0.06] text-slate-200'
          }`}
        >
          <DeviceIcon className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold tracking-tight text-slate-50">
              {getDeviceLabel(session.deviceInfo)}
            </p>
            {isCurrent ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Current Device
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-300">
            {session.ipAddress ?? 'IP unavailable'} - {relativeLabel}
          </p>
          <p className="mt-1 text-xs text-slate-400">Logged in at {loginTimeLabel}</p>
        </div>
      </div>

      {!isCurrent && onRevoke ? (
        <button
          type="button"
          onClick={() => onRevoke(session)}
          disabled={isRevoking}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <TrashIcon className="h-4 w-4" />
          Revoke
        </button>
      ) : null}
    </div>
  )
}

function RevokeSessionModal({
  session,
  onCancel,
  onConfirm,
  isPending,
  errorMessage,
}: {
  session: DeviceSession
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
  errorMessage: string | null
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[24px] border border-white/[0.08] bg-[#2f3136] p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Confirm revoke
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-50">
              Revoke this session?
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100"
            aria-label="Close confirmation"
          >
            <span className="text-2xl leading-none">x</span>
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
          <p className="text-sm font-semibold text-slate-100">{getDeviceLabel(session.deviceInfo)}</p>
          <p className="mt-1 text-sm text-slate-300">{session.ipAddress ?? 'IP unavailable'}</p>
          <p className="mt-1 text-xs text-slate-400">Logged in at {formatDateTime(session.createdAt)}</p>
        </div>

        <p className="mt-5 text-sm leading-6 text-slate-300">
          This will remove the session immediately. If this is the current device, you will be
          logged out and need to sign in again.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? 'Revoking...' : 'Revoke Session'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function UserSettingsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const currentSessionId = useAuthStore((state) => state.sessionId)
  const [viewMode, setViewMode] = useState<ViewMode>('account')
  const [sessionToRevoke, setSessionToRevoke] = useState<DeviceSession | null>(null)

  const sessionsQueryKey = useMemo(() => ['device-sessions', user?.id] as const, [user?.id])

  const sessionsQuery = useQuery({
    queryKey: sessionsQueryKey,
    queryFn: fetchDeviceSessions,
    enabled: Boolean(user),
  })

  const revokeMutation = useMutation({
    mutationFn: revokeDeviceSession,
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: sessionsQueryKey })

      const previousSessions = queryClient.getQueryData<DeviceSession[]>(sessionsQueryKey) ?? []

      queryClient.setQueryData<DeviceSession[]>(sessionsQueryKey, (current = []) =>
        current.filter((session) => session.id !== sessionId),
      )

      return { previousSessions }
    },
    onError: (_error, _sessionId, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(sessionsQueryKey, context.previousSessions)
      }
    },
    onSuccess: () => {
      setSessionToRevoke(null)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey })
    },
  })

  const sessions = sessionsQuery.data ?? []
  const currentSession = sessions.find((session) => session.id === currentSessionId) ?? null
  const otherSessions = sessions.filter((session) => session.id !== currentSessionId)
  const sessionsErrorMessage = sessionsQuery.error
    ? normalizeApiError(sessionsQuery.error, 'Failed to load logged-in devices.').message
    : null
  const revokeErrorMessage = revokeMutation.error
    ? normalizeApiError(revokeMutation.error, 'Failed to revoke session. Please try again.').message
    : null

  const openRevokeModal = (session: DeviceSession) => {
    revokeMutation.reset()
    setSessionToRevoke(session)
  }

  const confirmRevoke = () => {
    if (!sessionToRevoke) return
    revokeMutation.mutate(sessionToRevoke.id)
  }

  const deviceCountLabel = `${sessions.length} device${sessions.length === 1 ? '' : 's'}`

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2244_0%,#08101f_50%,#050816_100%)] p-4 text-white sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1500px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#2f3136] shadow-[0_30px_100px_rgba(0,0,0,0.52)]">
        <aside className="hidden w-[320px] shrink-0 border-r border-white/[0.08] bg-[#27292d] px-5 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  user?.avatarUrl ??
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80'
                }
                alt="Avatar pengguna"
                className="h-14 w-14 rounded-full border-2 border-slate-500 object-cover shadow-[0_0_0_4px_rgba(148,163,184,0.12)]"
              />
              <span className="absolute -bottom-0.5 right-0 h-4 w-4 rounded-full border-2 border-[#27292d] bg-emerald-500" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{user?.username ?? 'Hanz'}</p>
              <p className="text-sm text-slate-500">Edit Profiles</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-[#1f2125] px-4 py-3">
            <div className="flex items-center gap-3 text-slate-400">
              <SearchIcon className="h-4 w-4" />
              <span className="text-sm">Search</span>
            </div>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto pr-1">
            <div className="space-y-1">
              <SidebarItem
                label="Account"
                icon={SettingsIcon}
                active
                onClick={() => setViewMode('account')}
              />

              <div className="ml-4 border-l border-white/10 pl-4">
                <button
                  type="button"
                  onClick={() => setViewMode('account')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                    viewMode === 'account'
                      ? 'text-slate-50'
                      : 'text-slate-500 hover:text-slate-100'
                  }`}
                >
                  <span className={`h-8 w-1 rounded-full ${viewMode === 'account' ? 'bg-slate-200' : 'bg-transparent'}`} />
                  <span>Account Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('sessions')}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                    viewMode === 'sessions'
                      ? 'text-slate-50'
                      : 'text-slate-500 hover:text-slate-100'
                  }`}
                >
                  <span className={`h-8 w-1 rounded-full ${viewMode === 'sessions' ? 'bg-slate-200' : 'bg-transparent'}`} />
                  <span>Password & Security</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-500 transition hover:text-slate-100"
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

        <section className="flex min-w-0 flex-1 flex-col bg-[#2f3136]">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
            <div>
              {viewMode === 'sessions' ? (
                <button
                  type="button"
                  onClick={() => setViewMode('account')}
                  className="flex items-center gap-3 text-left text-sm font-semibold text-slate-300 transition hover:text-slate-50"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span>Account / Logged-in Devices</span>
                </button>
              ) : (
                <>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Account
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
                    User Settings
                  </h1>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate('/app')}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white/[0.08] hover:text-slate-100"
              aria-label="Close settings"
            >
              <span className="text-2xl leading-none">x</span>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            <div className="mx-auto max-w-4xl">
              {viewMode === 'account' ? (
                <section className="rounded-3xl border border-white/[0.08] bg-white/[0.04] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                  <div className="mb-8">
                    <p className="text-xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                      Account Info
                    </p>
                  </div>

                  <SettingsRow label="Username" value={user?.username ?? 'hanz0279'} />
                  <SettingsRow label="Email" value={user?.email ?? 'rayhangemmim8@gmail.com'} />
                  <SettingsRow label="Phone Number" value="*********6729" />

                  <div className="my-8 border-t border-white/[0.08]" />

                  <div className="mb-2">
                    <p className="text-xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                      Password & Security
                    </p>
                  </div>

                  <SettingsRow label="Password" value="************" />

                  <button
                    type="button"
                    className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 py-4"
                  >
                    <span className="text-left text-sm font-medium text-slate-100">
                      Multi-Factor Authentication
                    </span>
                    <span className="text-sm font-semibold text-slate-100">Set up</span>
                    <ChevronRightIcon className="h-5 w-5 text-slate-500" />
                  </button>

                  <SettingsLinkRow
                    label="Logged-in Devices"
                    value={deviceCountLabel}
                    onClick={() => setViewMode('sessions')}
                  />

                  <div className="my-8 border-t border-white/[0.08]" />

                  <div className="mb-2">
                    <p className="text-xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                      Account Standing
                    </p>
                  </div>

                  <p className="max-w-2xl text-sm leading-6 text-slate-300">
                    Bagian ini disiapkan untuk menampilkan status akun, peringatan keamanan, dan
                    sesi aktif secara detail. Untuk sekarang, kita tampilkan struktur halaman dan
                    akses menuju sub-halaman perangkat.
                  </p>
                </section>
              ) : (
                <section className="space-y-8 rounded-3xl border border-white/[0.08] bg-white/[0.04] px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                  <div className="max-w-2xl">
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-50">
                      Logged-in Devices
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      These are the devices currently logged in to your account. Revoke sessions
                      you do not recognize.
                    </p>
                  </div>

                  {sessionsErrorMessage ? (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {sessionsErrorMessage}
                    </div>
                  ) : null}

                  {sessionsQuery.isLoading ? (
                    <div className="space-y-4">
                      <div className="h-28 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.03]" />
                      <div className="h-24 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.03]" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Current Device
                        </p>

                        {currentSession ? (
                          <DeviceSessionCard
                            session={currentSession}
                            isCurrent
                            isRevoking={revokeMutation.isPending}
                          />
                        ) : (
                          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                            Current session could not be identified for this account.
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Other Devices
                        </p>

                        {otherSessions.length > 0 ? (
                          <div className="space-y-4">
                            {otherSessions.map((session) => (
                              <DeviceSessionCard
                                key={session.id}
                                session={session}
                                isCurrent={false}
                                onRevoke={openRevokeModal}
                                isRevoking={revokeMutation.isPending}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-5 text-sm text-slate-300">
                            No other active sessions were found.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </section>
              )}
            </div>
          </div>
        </section>
      </div>

      {sessionToRevoke ? (
        <RevokeSessionModal
          session={sessionToRevoke}
          onCancel={() => {
            revokeMutation.reset()
            setSessionToRevoke(null)
          }}
          onConfirm={confirmRevoke}
          isPending={revokeMutation.isPending}
          errorMessage={revokeErrorMessage}
        />
      ) : null}
    </main>
  )
}

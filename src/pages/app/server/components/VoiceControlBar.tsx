import type { VoiceSessionView } from '../../../../state/voice.state'

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z" fill="currentColor" />
      <path
        d="M5 11a7 7 0 0014 0M12 18v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z" fill="currentColor" />
      <path d="M5 11a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 5l14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function LeaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M10 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 5h2a2 2 0 012 2v10a2 2 0 01-2 2h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function VoiceControlBar({
  session,
  loading,
  error,
  onToggleMute,
  onLeave,
}: {
  session: VoiceSessionView
  loading: boolean
  error: string | null
  onToggleMute: () => void
  onLeave: () => void
}) {
  if (!session.channelId || session.status === 'idle') {
    return null
  }

  const statusLabel =
    session.status === 'connecting'
      ? 'Connecting...'
      : session.status === 'error'
        ? 'Connection error'
        : session.isMuted
          ? 'Microphone muted'
          : 'Microphone active'

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 px-4 md:bottom-4 md:px-6">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 rounded-[28px] border border-white/[0.08] bg-[#202225]/96 px-4 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Voice Channel
          </p>
          <h2 className="mt-1 truncate text-base font-semibold text-white">
            {session.channelName ?? 'Voice channel'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {statusLabel}
            {session.serverName ? ` · ${session.serverName}` : ''}
          </p>
          {error ? <p className="mt-2 text-sm text-rose-200">{error}</p> : null}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            disabled={loading || session.status !== 'connected'}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {session.isMuted ? <MicOffIcon /> : <MicIcon />}
            <span>{session.isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            type="button"
            onClick={onLeave}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LeaveIcon />
            <span>Leave</span>
          </button>
        </div>
      </div>
    </div>
  )
}


import { useNavigate } from 'react-router-dom'
import { SettingsIcon } from '../app-icons'

type Variant = 'sidebar' | 'mobile'

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 4a3 3 0 00-3 3v4H7l-3 3v-4H2V9l5-5h2a3 3 0 013 3z" fill="currentColor" />
      <path d="M16.5 8.5l5 5M21.5 8.5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function HeadphonesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 13a8 8 0 1116 0v5a2 2 0 01-2 2h-2v-7h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13a8 8 0 0116 0v5a2 2 0 01-2 2h-2v-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CaretDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserAvatar() {
  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500">
      <div className="absolute inset-0 grid place-items-center text-sm font-black text-white">a</div>
      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#2B2D31] bg-[#3BA55D]" />
    </div>
  )
}

export function AppUserPanel({ variant = 'sidebar' }: { variant?: Variant }) {
  const navigate = useNavigate()

  if (variant === 'mobile') {
    return (
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/[0.08] bg-[#202225]/96 px-3 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3 rounded-3xl bg-[#2B2D31] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
          <UserAvatar />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold leading-5 text-white">apcbdwa</p>
            <p className="text-xs text-slate-400">Online</p>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition hover:bg-white/[0.08]"
              aria-label="Mute microphone"
            >
              <MuteIcon />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition hover:bg-white/[0.08]"
              aria-label="Deafen"
            >
              <HeadphonesIcon />
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/settings')}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition hover:bg-white/[0.08]"
              aria-label="Open settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-white/[0.06] p-4">
      <div className="flex items-center gap-3 rounded-2xl bg-[#202225] px-3 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <UserAvatar />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">apcbdwa</p>
          <p className="text-xs text-slate-400">Online</p>
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Mute microphone"
          >
            <MuteIcon />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Deafen"
          >
            <HeadphonesIcon />
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/settings')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition hover:bg-white/[0.08]"
            aria-label="Open settings"
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

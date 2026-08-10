type IconProps = {
  className?: string
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function FriendsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M8.5 12.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M15.5 13c1.93 0 3.5-1.57 3.5-3.5S17.43 6 15.5 6 12 7.57 12 9.5 13.57 13 15.5 13z"
        fill="currentColor"
        opacity="0.82"
      />
      <path
        d="M4.5 19.5c0-2.48 2.01-4.5 4.5-4.5h1c2.49 0 4.5 2.02 4.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ShopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 9h16v10H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 9l2-5h12l2 5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function QuestIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3l7 4v5c0 4.5-2.8 8.5-7 9-4.2-.5-7-4.5-7-9V7l7-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function AddIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  )
}

export function CompassIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M15.5 8.5l-2.1 5.6-5.6 2.1 2.1-5.6 5.6-2.1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function BellIcon({ className }: IconProps) {
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

export function InboxIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 5h16v14H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 14h4l2 3h4l2-3h4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function HelpIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9.8 9a2.5 2.5 0 114.4 1.6c-.8.8-1.8 1.2-1.8 2.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 17h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function MessageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 5h14v10H9l-4 4V5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MoreIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="5" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="19" r="1.6" fill="currentColor" />
    </svg>
  )
}

export function SettingsIcon({ className }: IconProps) {
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

export function VoiceIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z" fill="currentColor" />
      <path d="M5 11a7 7 0 0014 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3c2.6 2.6 4 5.8 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.8-4-9s1.4-6.4 4-9z" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export function AddFriendIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path
        d="M4.5 19.5c0-2.49 2.01-4.5 4.5-4.5h6c2.49 0 4.5 2.01 4.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 11.5l8-6 8 6V20H4v-8.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9.5 20v-6h5v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}


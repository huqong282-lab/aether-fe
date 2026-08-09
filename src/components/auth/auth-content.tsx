export const featureItems = [
  {
    title: 'Chat',
    description: 'Talk in real time with your friends',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
  },
  {
    title: 'Community',
    description: 'Create or join amazing servers',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
  },
  {
    title: 'Secure',
    description: 'Your privacy is our priority',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
] as const

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.95h5.62c-.24 1.18-.94 2.18-2 2.86v2.38h3.24c1.89-1.74 2.98-4.31 2.98-7.35 0-.71-.06-1.38-.17-2h-9.67z"
      />
      <path
        fill="#34A853"
        d="M6.79 14.18l-.68.52-2.4 1.87a9.997 9.997 0 0018.15-5.07h-6.06a5.75 5.75 0 01-8.06 2.68z"
      />
      <path
        fill="#FBBC05"
        d="M4.9 8.18a10 10 0 000 7.2l3.08-2.39a5.95 5.95 0 010-2.42z"
      />
      <path
        fill="#4285F4"
        d="M12 4.75a5.5 5.5 0 013.9 1.53l2.9-2.9A9.74 9.74 0 0012 2a9.997 9.997 0 00-7.1 3.18l3.08 2.39A5.97 5.97 0 0112 4.75z"
      />
    </svg>
  )
}


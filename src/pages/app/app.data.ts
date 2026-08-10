export type PresenceState = 'online' | 'idle' | 'dnd' | 'offline'

export type SidebarItem = {
  label: string
  icon: string
  active?: boolean
  unread?: boolean
}

export type DirectMessageItem = {
  name: string
  detail: string
  presence: PresenceState
  accent: string
  badge?: string
}

export type FriendItem = {
  name: string
  detail: string
  status: string
  accent: string
}

export type ActiveNowItem = {
  title: string
  detail: string
  time: string
  accent: string
  badge?: string
}

export const serverItems = [
  { label: 'Aether', accent: 'bg-[#5865F2]', active: true },
  { label: 'DS', accent: 'bg-[#3BA55D]' },
  { label: 'JS', accent: 'bg-[#ED4245]' },
  { label: 'UX', accent: 'bg-[#FAA61A]' },
  { label: 'AI', accent: 'bg-[#3BA55D]' },
  { label: 'Add', accent: 'bg-white/10' },
] as const

export const sidebarItems: SidebarItem[] = [
  { label: 'Friends', icon: 'friends', active: true },
  { label: 'Shop', icon: 'shop' },
  { label: 'Quests', icon: 'quest' },
]

export const directMessages: DirectMessageItem[] = [
  {
    name: 'Hanz',
    detail: 'TBH: Task Bar Hero with Medal',
    presence: 'dnd',
    accent: 'from-sky-400 to-sky-600',
    badge: 'elle',
  },
  {
    name: 'Raka',
    detail: 'Mode belajar malam ini',
    presence: 'online',
    accent: 'from-emerald-400 to-emerald-600',
  },
  {
    name: 'Dita',
    detail: 'Project UI layout review',
    presence: 'idle',
    accent: 'from-fuchsia-400 to-fuchsia-600',
  },
]

export const friendItems: FriendItem[] = [
  {
    name: 'Hanz',
    detail: 'TBH: Task Bar Hero with Medal',
    status: 'Online',
    accent: 'from-sky-400 to-sky-600',
  },
]

export const activeNowItems: ActiveNowItem[] = [
  {
    title: 'Hanz',
    detail: 'TBH: Task Bar Hero with Medal - 6h',
    time: 'Live activity',
    accent: 'from-sky-400 to-sky-600',
    badge: 'M',
  },
  {
    title: 'Clipping TBH: Task Bar Hero',
    detail: 'with Medal',
    time: '06:25:51 elapsed',
    accent: 'from-slate-100 to-slate-300',
    badge: 'M',
  },
]


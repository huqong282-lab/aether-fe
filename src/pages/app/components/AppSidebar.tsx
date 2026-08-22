import { FriendsIcon, QuestIcon, SearchIcon, ShopIcon } from '../app-icons'
import { directMessages, sidebarItems } from '../app.data'
import { AppUserPanel } from './AppUserPanel'

type AppSidebarProps = {
  onSearchClick: () => void
}

function PresenceDot({ state }: { state: 'online' | 'idle' | 'dnd' | 'offline' }) {
  const classes = {
    online: 'bg-[#3BA55D]',
    idle: 'bg-[#FAA61A]',
    dnd: 'bg-[#ED4245]',
    offline: 'bg-[#747F8D]',
  }[state]

  return <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#2F3136] ${classes}`} />
}

function Avatar({ name, accent, presence }: { name: string; accent: string; presence: 'online' | 'idle' | 'dnd' | 'offline' }) {
  return (
    <div className="relative h-10 w-10 shrink-0">
      <div
        className={[
          'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white',
          accent,
        ].join(' ')}
      >
        {name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)}
      </div>
      <PresenceDot state={presence} />
    </div>
  )
}

export function AppSidebar({ onSearchClick }: AppSidebarProps) {
  return (
    <aside className="hidden w-[320px] shrink-0 border-r border-white/[0.06] bg-[#2F3136] lg:flex lg:flex-col">
      <div className="border-b border-white/[0.06] p-4">
        <button
          type="button"
          onClick={onSearchClick}
          className="flex w-full items-center gap-3 rounded-2xl bg-black/20 px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
        >
          <SearchIcon className="h-4 w-4 text-slate-400" />
          <span className="truncate">Find or start a conversation</span>
        </button>
      </div>

      <nav className="border-b border-white/[0.06] px-4 py-3">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const icon =
              item.icon === 'friends' ? (
                <FriendsIcon className="h-5 w-5" />
              ) : item.icon === 'shop' ? (
                <ShopIcon className="h-5 w-5" />
              ) : (
                <QuestIcon className="h-5 w-5" />
              )

            return (
              <div
                key={item.label}
                className={[
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium',
                  item.active ? 'bg-white/10 text-white' : 'text-slate-400',
                ].join(' ')}
              >
                <span className="text-slate-300">{icon}</span>
                <span>{item.label}</span>
              </div>
            )
          })}
        </div>
      </nav>

      <div className="flex-1 px-4 py-4">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
          <span>Direct Messages</span>
          <span className="text-lg leading-none text-slate-300">+</span>
        </div>

        <div className="space-y-2">
          {directMessages.map((item) => (
            <div
              key={item.name}
              className="group flex items-center gap-3 rounded-2xl bg-black/10 px-3 py-3 text-left transition hover:bg-white/[0.06]"
            >
              <Avatar name={item.name} accent={item.accent} presence={item.presence} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                  {item.badge ? (
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-slate-200">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-xs text-slate-400">{item.detail}</p>
              </div>
              <div className="rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 opacity-0 transition group-hover:opacity-100">
                Wave
              </div>
            </div>
          ))}
        </div>
      </div>

      <AppUserPanel />
    </aside>
  )
}

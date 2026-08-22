import { AddFriendIcon, GlobeIcon, MessageIcon, MoreIcon, SearchIcon } from '../app-icons'
import { friendItems } from '../app.data'

type AppMainProps = {
  onSearchClick: () => void
}

function Avatar({ name, accent }: { name: string; accent: string }) {
  return (
    <div
      className={[
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white',
        accent,
      ].join(' ')}
    >
      {name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)}
    </div>
  )
}

export function AppMain({ onSearchClick }: AppMainProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[#36393F]">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 lg:px-6">
        <div className="flex items-center gap-3">
          <GlobeIcon className="h-5 w-5 text-slate-300" />
          <div>
            <h1 className="text-lg font-semibold text-white">Friends</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-xl bg-white/[0.08] px-3 py-2 text-sm text-slate-300 xl:flex">
            <span>Online</span>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white">All</div>
          <div className="rounded-xl bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(88,101,242,0.35)]">
            Add Friend
          </div>
        </div>
      </header>

      <div className="border-b border-white/[0.06] px-5 py-4 lg:px-6">
        <button
          type="button"
          onClick={onSearchClick}
          className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#202225] px-4 py-3 text-left text-slate-400 transition hover:border-white/[0.14] hover:bg-[#25272b] hover:text-slate-200"
        >
          <SearchIcon className="h-5 w-5 text-slate-500" />
          <span>Search</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 lg:px-6">
        <div className="mb-6 text-sm font-semibold text-slate-200">All friends — 1</div>

        <div className="space-y-3">
          {friendItems.map((friend) => (
            <div
              key={friend.name}
              className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-4 transition hover:bg-white/5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <Avatar name={friend.name} accent={friend.accent} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-semibold text-white">{friend.name}</p>
                    <span className="rounded-full bg-[#3BA55D]/20 px-2 py-0.5 text-[11px] font-semibold text-[#8be28f]">
                      {friend.status}
                    </span>
                  </div>
                  <p className="truncate text-sm text-slate-400">
                    <span className="mr-2 inline-flex items-center gap-1 text-[#3BA55D]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#3BA55D]" />
                    </span>
                    {friend.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                  <MessageIcon className="h-5 w-5" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                  <MoreIcon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-5 py-4 lg:px-6">
        <div className="flex items-center justify-between rounded-2xl bg-[#202225] px-4 py-3 text-sm text-slate-300">
          <div>
            <p className="font-semibold text-white">Aether workspace preview</p>
            <p className="text-xs text-slate-400">
              Tampilan placeholder saja, tanpa interaksi backend untuk fase ini.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 font-semibold text-white"
          >
            <AddFriendIcon className="h-4 w-4" />
            Invite
          </button>
        </div>
      </div>
    </section>
  )
}

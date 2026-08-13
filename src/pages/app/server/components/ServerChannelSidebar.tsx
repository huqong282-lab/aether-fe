import { useMemo, useState } from 'react'
import { useChannelReadStore } from '../../../../state/channel.state'
import type {
  ServerCategoryRecord,
  ServerChannelRecord,
  ServerWorkspaceRecord,
} from '../../../../lib/server/server-workspace.api'
import { AppUserPanel } from '../../components/AppUserPanel'

function TextChannelIcon() {
  return <span className="text-sm font-black leading-none">#</span>
}

function VoiceChannelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M6 10h4l5-4v12l-5-4H6v-4z" fill="currentColor" />
      <path d="M18 9a4 4 0 010 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function VideoChannelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="4" y="7" width="12" height="10" rx="2" fill="currentColor" />
      <path d="M16 10l4-2v8l-4-2v-4z" fill="currentColor" />
    </svg>
  )
}

function ForumChannelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M5 6h14M5 12h10M5 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function AnnouncementChannelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M5 13l10-6v10l-10-4z" fill="currentColor" />
      <path d="M15 8a4 4 0 010 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ChannelTypeIcon({ type }: { type: ServerChannelRecord['type'] }) {
  switch (type.toUpperCase()) {
    case 'VOICE':
      return <VoiceChannelIcon />
    case 'VIDEO':
      return <VideoChannelIcon />
    case 'FORUM':
      return <ForumChannelIcon />
    case 'ANNOUNCEMENT':
      return <AnnouncementChannelIcon />
    case 'TEXT':
    default:
      return <TextChannelIcon />
  }
}

function CategoryRow({
  category,
  channelCount,
  isOpen,
  onToggle,
}: {
  category: ServerCategoryRecord
  channelCount: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl px-1 py-2 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400 transition hover:text-slate-200"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="text-base leading-none">{isOpen ? 'v' : '>'}</span>
        <span className="truncate">{category.name}</span>
      </span>
      <span className="text-[10px] tracking-[0.14em] text-slate-500">{channelCount}</span>
    </button>
  )
}

function ChannelItem({
  serverId,
  channel,
  isActive,
  isUnread,
  onSelect,
}: {
  serverId: string
  channel: ServerChannelRecord
  isActive: boolean
  isUnread: boolean
  onSelect: (channelId: string) => void
}) {
  const labelTone = isActive
    ? 'bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]'
    : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'

  return (
    <button
      type="button"
      onClick={() => onSelect(channel.id)}
      className={[
        'group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[#5865F2]/70',
        labelTone,
      ].join(' ')}
      aria-label={`Open ${channel.name} in server ${serverId}`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 group-hover:text-slate-200">
        <ChannelTypeIcon type={channel.type} />
      </span>

      <span
        className={['min-w-0 flex-1 truncate', isActive || isUnread ? 'font-semibold' : 'font-medium'].join(' ')}
      >
        {channel.name}
      </span>

      {isUnread ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#3BA55D]" aria-hidden="true" /> : null}
    </button>
  )
}

export function ServerChannelSidebar({
  workspace,
  categorizedChannels,
  uncategorizedChannels,
  activeChannelId,
  onSelectChannel,
}: {
  workspace: ServerWorkspaceRecord
  categorizedChannels: Map<string, ServerChannelRecord[]>
  uncategorizedChannels: ServerChannelRecord[]
  activeChannelId: string | null
  onSelectChannel: (channelId: string) => void
}) {
  const isChannelUnread = useChannelReadStore((state) => state.isChannelUnread)
  const [openCategoryIds, setOpenCategoryIds] = useState<Record<string, boolean>>({})

  const categoryList = useMemo(() => [...workspace.categories], [workspace.categories])

  return (
    <aside className="hidden w-[320px] shrink-0 border-r border-white/[0.06] bg-[#2F3136] lg:flex lg:flex-col">
      <div className="border-b border-white/[0.06] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">{workspace.server.name}</p>
            <p className="text-sm text-slate-400">Category & channel tree</p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Server options"
          >
            ...
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-4 rounded-2xl bg-black/20 px-4 py-3 text-sm text-slate-300">
          <div className="font-semibold text-white">Server Channels</div>
          <div className="mt-1 text-xs text-slate-400">Klik channel untuk masuk ke dalam server.</div>
        </div>

        <div className="space-y-3">
          {categoryList.map((category) => {
            const categoryChannels = categorizedChannels.get(category.id) ?? []
            const isOpen = openCategoryIds[category.id] ?? true

            return (
              <div key={category.id} className="rounded-2xl bg-black/10 px-2 py-2">
                <CategoryRow
                  category={category}
                  channelCount={categoryChannels.length}
                  isOpen={isOpen}
                  onToggle={() =>
                    setOpenCategoryIds((current) => ({
                      ...current,
                      [category.id]: !isOpen,
                    }))
                  }
                />

                {isOpen ? (
                  <div className="space-y-1 pb-1">
                    {categoryChannels.map((channel) => (
                      <ChannelItem
                        key={channel.id}
                        serverId={workspace.server.id}
                        channel={channel}
                        isActive={channel.id === activeChannelId}
                        isUnread={isChannelUnread(workspace.server.id, channel.id)}
                        onSelect={onSelectChannel}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}

          {uncategorizedChannels.length > 0 ? (
            <div className="rounded-2xl bg-black/10 px-2 py-2">
              <div className="px-1 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                No Category
              </div>

              <div className="space-y-1 pb-1">
                {uncategorizedChannels.map((channel) => (
                  <ChannelItem
                    key={channel.id}
                    serverId={workspace.server.id}
                    channel={channel}
                    isActive={channel.id === activeChannelId}
                    isUnread={isChannelUnread(workspace.server.id, channel.id)}
                    onSelect={onSelectChannel}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <AppUserPanel />
    </aside>
  )
}

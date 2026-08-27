import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useChannelReadStore } from '../../../../state/channel.state'
import { normalizeApiError } from '../../../../lib/api-error'
import {
  createServerChannelRequest,
  serverWorkspaceQueryKeys,
} from '../../../../lib/server/server-workspace.api'
import { useVoiceStateStore, type VoiceParticipantView } from '../../../../state/voice.state'
import type {
  ServerCategoryRecord,
  ServerChannelRecord,
  ServerWorkspaceRecord,
} from '../../../../lib/server/server-workspace.api'
import { AppUserPanel } from '../../components/AppUserPanel'
import { SettingsIcon } from '../../app-icons'

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

function VoiceParticipantRow({ participant }: { participant: VoiceParticipantView }) {
  return (
    <div
      className="flex items-center gap-2 text-xs text-slate-300"
      title={participant.isMuted ? 'Muted' : 'Unmuted'}
    >
      <span
        className={[
          'flex h-4 w-4 items-center justify-center rounded-full',
          participant.isLocal ? 'bg-[#5865F2]/20 text-[#9aa8ff]' : 'bg-white/[0.06] text-slate-400',
        ].join(' ')}
      >
        {participant.isLocal ? '◉' : '•'}
      </span>
      <span className="min-w-0 truncate">
        {participant.displayName}
        {participant.isLocal ? ' (You)' : ''}
      </span>
      {participant.isMuted ? (
        <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
          muted
        </span>
      ) : null}
    </div>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  )
}

function ChannelAddIcon({
  type,
}: {
  type: 'TEXT' | 'VOICE'
}) {
  return type === 'VOICE' ? (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M6 10h4l5-4v12l-5-4H6v-4z" fill="currentColor" />
      <path d="M12 16v5M9.5 18.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <PlusIcon />
  )
}

function ChannelItem({
  serverId,
  channel,
  isActive,
  isUnread,
  voiceParticipants,
  onSelect,
}: {
  serverId: string
  channel: ServerChannelRecord
  isActive: boolean
  isUnread: boolean
  voiceParticipants: VoiceParticipantView[]
  onSelect: (channel: ServerChannelRecord) => void | Promise<void>
}) {
  const labelTone = isActive
    ? 'bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]'
    : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => {
          void onSelect(channel)
        }}
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

      {channel.type === 'VOICE' && voiceParticipants.length > 0 ? (
        <div className="ml-7 space-y-1 border-l border-white/[0.06] pl-3">
          {voiceParticipants.map((participant) => (
            <VoiceParticipantRow key={participant.sid} participant={participant} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ServerChannelSidebar({
  workspace,
  categorizedChannels,
  uncategorizedChannels,
  activeChannelId,
  onSelectChannel,
  onServerSettingsClick,
}: {
  workspace: ServerWorkspaceRecord
  categorizedChannels: Map<string, ServerChannelRecord[]>
  uncategorizedChannels: ServerChannelRecord[]
  activeChannelId: string | null
  onSelectChannel: (channel: ServerChannelRecord) => void | Promise<void>
  onServerSettingsClick: () => void
}) {
  const isChannelUnread = useChannelReadStore((state) => state.isChannelUnread)
  const voiceSession = useVoiceStateStore((state) => state)
  const queryClient = useQueryClient()
  const [openCategoryIds, setOpenCategoryIds] = useState<Record<string, boolean>>({})
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false)
  const serverMenuRef = useRef<HTMLDivElement | null>(null)

  const categoryList = useMemo(() => [...workspace.categories], [workspace.categories])
  const createChannelMutation = useMutation({
    mutationFn: async (type: 'TEXT' | 'VOICE') => {
      const existingNames = new Set(
        workspace.channels.map((channel) => channel.name.trim().toLowerCase()),
      )

      const baseName = type === 'VOICE' ? 'new-voice-channel' : 'new-text-channel'
      let candidateName = baseName
      let counter = 2
      while (existingNames.has(candidateName)) {
        candidateName = `${baseName}-${counter}`
        counter += 1
      }

      return createServerChannelRequest(workspace.server.id, {
        name: candidateName,
        type,
        categoryId: workspace.categories[0]?.id ?? null,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: serverWorkspaceQueryKeys.server(workspace.server.id),
      })
      setIsServerMenuOpen(false)
    },
  })

  const createChannelError = createChannelMutation.error
    ? normalizeApiError(createChannelMutation.error, 'Gagal membuat channel baru.').message
    : null

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!serverMenuRef.current?.contains(event.target as Node)) {
        setIsServerMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsServerMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const voiceParticipantsForChannel = (channel: ServerChannelRecord) =>
    channel.type === 'VOICE' && voiceSession.channelId === channel.id ? voiceSession.participants : []

  return (
    <aside className="hidden w-[320px] shrink-0 border-r border-white/[0.06] bg-[#2F3136] lg:flex lg:flex-col">
      <div className="border-b border-white/[0.06] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-white">{workspace.server.name}</p>
            <p className="text-sm text-slate-400">Category & channel tree</p>
          </div>
          <div className="relative shrink-0" ref={serverMenuRef}>
            <button
              type="button"
              onClick={() => setIsServerMenuOpen((current) => !current)}
              className="flex items-center gap-2 rounded-full border border-white/80 bg-transparent px-3 py-2 text-slate-100 transition hover:bg-white/[0.06]"
              aria-label="Server options"
              aria-haspopup="menu"
              aria-expanded={isServerMenuOpen}
            >
              <SettingsIcon className="h-4 w-4 shrink-0 text-slate-300" />
              <span className="text-xs leading-none text-slate-400" aria-hidden="true">
                {isServerMenuOpen ? '^' : 'v'}
              </span>
            </button>

            {isServerMenuOpen ? (
              <div
                role="menu"
                aria-label="Server options"
                className="absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#2f3136] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsServerMenuOpen(false)
                    onServerSettingsClick()
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/[0.06]"
                >
                  <SettingsIcon className="h-4 w-4 shrink-0 text-slate-300" />
                  <span>Server Settings</span>
                </button>

                <div className="my-2 border-t border-white/[0.06]" />

                <button
                  type="button"
                  role="menuitem"
                  disabled={createChannelMutation.isPending}
                  onClick={() => {
                    void createChannelMutation.mutateAsync('TEXT')
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center text-slate-300">
                    <ChannelAddIcon type="TEXT" />
                  </span>
                  <span>{createChannelMutation.isPending ? 'Membuat channel...' : 'Tambah Channel'}</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  disabled={createChannelMutation.isPending}
                  onClick={() => {
                    void createChannelMutation.mutateAsync('VOICE')
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center text-slate-300">
                    <ChannelAddIcon type="VOICE" />
                  </span>
                  <span>{createChannelMutation.isPending ? 'Membuat voice...' : 'Tambah Voice'}</span>
                </button>

                {createChannelError ? (
                  <div className="px-3 pb-2 pt-1 text-xs text-rose-200">{createChannelError}</div>
                ) : null}
              </div>
            ) : null}
          </div>
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
                        voiceParticipants={voiceParticipantsForChannel(channel)}
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
                    voiceParticipants={voiceParticipantsForChannel(channel)}
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

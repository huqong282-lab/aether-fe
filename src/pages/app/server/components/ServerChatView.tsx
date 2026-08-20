import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../../../state/auth.state'
import type { ServerChannelRecord, ServerWorkspaceRecord } from '../../../../lib/server/server-workspace.api'
import { getServerMembersRequest, type ServerMemberMentionRecord } from '../../../../lib/server/server-members.api'
import {
  addMessageReactionRequest,
  createChannelMessageRequest,
  getChannelMessagesRequest,
  getMessageReactionsRequest,
  pinMessageRequest,
  removeMessageReactionRequest,
  type MessageRecord,
  type ReactionRecord,
  unpinMessageRequest,
} from '../../../../lib/message/message.api'
import {
  getChannelReadReceiptRequest,
  updateChannelReadReceiptRequest,
} from '../../../../lib/message/read-receipt.api'
import { useRealtimeConnection } from '../../../../lib/websocket'
import {
  createChatMembers,
  createId,
  DEFAULT_VISIBLE_MESSAGE_COUNT,
  formatFileSize,
  formatLongMessageTime,
  getActiveMentionRange,
  toAttachmentPreview,
} from './chat/chat.utils'
import type { ChatMember, ChatMessage, ChannelChatSnapshot } from './chat/chat.types'
import { MessageComposer } from './chat/MessageComposer'
import { MessageList } from './chat/MessageList'

function mapMessageRecordToChatMessage(
  record: MessageRecord,
  status: ChatMessage['status'] = 'sent',
  reactions: ChatMessage['reactions'] = [],
): ChatMessage {
  return {
    id: record.id,
    authorId: record.authorId,
    content: record.content,
    createdAt: record.createdAt,
    status,
    reactions,
    isPinned: record.isPinned,
    attachments: record.attachments?.map((attachment) => ({
      id: attachment.id,
      name: attachment.fileName,
      sizeLabel: formatFileSize(Number(attachment.fileSize)),
    })),
  }
}

function sortMessagesByCreatedAt(messages: ChatMessage[]) {
  return [...messages].sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
}

function getPresenceToneClass(state: ChatMember['presence']) {
  return {
    online: 'bg-[#3BA55D]',
    idle: 'bg-[#FAA61A]',
    dnd: 'bg-[#ED4245]',
    offline: 'bg-[#747F8D]',
  }[state]
}

function getPresenceLabel(state: ChatMember['presence']) {
  return {
    online: 'Online',
    idle: 'Idle / AFK',
    dnd: 'Do Not Disturb',
    offline: 'Offline',
  }[state]
}

function createMemberAccent(name: string) {
  const accents = [
    'from-fuchsia-500 to-rose-500',
    'from-sky-400 to-cyan-500',
    'from-emerald-400 to-teal-500',
    'from-violet-400 to-indigo-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
    'from-cyan-400 to-blue-500',
  ]

  const normalized = name.trim().toLowerCase()
  const hash = [...normalized].reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0)
  return accents[hash % accents.length]
}

type ServerMemberView = {
  id: string
  displayName: string
  username: string
  avatarUrl: string | null
  presence: ChatMember['presence']
  accent: string
}

function mapServerMemberToView(member: ServerMemberMentionRecord): ServerMemberView {
  const displayName = member.displayName?.trim() || member.username?.trim() || 'Member'
  const username = member.username?.trim() || displayName.toLowerCase().replace(/\s+/g, '')
  const presence = member.presence ?? 'offline'

  return {
    id: member.id,
    displayName,
    username,
    avatarUrl: member.avatarUrl,
    presence,
    accent: createMemberAccent(displayName),
  }
}

function groupMembersByPresence(members: ServerMemberView[]) {
  const orderedStatuses: ChatMember['presence'][] = ['online', 'idle', 'dnd', 'offline']
  const grouped = new Map<ChatMember['presence'], ServerMemberView[]>()

  for (const status of orderedStatuses) {
    grouped.set(status, [])
  }

  for (const member of members) {
    const next = grouped.get(member.presence) ?? []
    next.push(member)
    grouped.set(member.presence, next)
  }

  return orderedStatuses
    .map((status) => ({
      status,
      members: (grouped.get(status) ?? []).sort((left, right) =>
        left.displayName.localeCompare(right.displayName, 'id-ID'),
      ),
    }))
    .filter((group) => group.members.length > 0)
}

function mapReactionRecordsToChatReactions(records: ReactionRecord[], currentUserId: string | null) {
  const grouped = new Map<
    string,
    {
      emoji: string
      count: number
      users: string[]
      reactedByCurrentUser: boolean
    }
  >()

  for (const record of records) {
    const existing = grouped.get(record.emoji)
    const displayUser = record.userId === currentUserId ? 'You' : record.userId

    if (!existing) {
      grouped.set(record.emoji, {
        emoji: record.emoji,
        count: 1,
        users: [displayUser],
        reactedByCurrentUser: record.userId === currentUserId,
      })
      continue
    }

    existing.count += 1
    existing.users.push(displayUser)
    existing.reactedByCurrentUser = existing.reactedByCurrentUser || record.userId === currentUserId
  }

  return [...grouped.values()]
}

function PinIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} className="h-4 w-4" aria-hidden="true">
      <path
        d="M14.5 3l6.5 6.5-2.3 2.3-1.2-.4-2.6 2.6v3.1l-1.3 1.3-2.6-2.6-4.2 4.2-1.6-1.6 4.2-4.2-2.6-2.6 1.3-1.3h3.1l2.6-2.6-.4-1.2L14.5 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PinnedMessagesPanel({
  messages,
  members,
  onJump,
  onRemovePin,
  onClose,
}: {
  messages: ChatMessage[]
  members: ChatMember[]
  onJump: (messageId: string) => void
  onRemovePin: (messageId: string) => void
  onClose: () => void
}) {
  return (
    <div className="absolute right-4 top-16 z-30 w-[min(92vw,420px)] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#2b2d31] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#5865F2]/18 text-[#d8ddff]">
            <PinIcon filled />
          </span>
          <div>
            <p className="text-lg font-semibold text-white">Pinned Messages</p>
            <p className="text-xs text-slate-400">{messages.length} pesan ter-pin di channel ini</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.08]"
          aria-label="Close pinned messages"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="max-h-[66vh] space-y-3 overflow-y-auto p-4">
        {messages.map((message) => {
          const member = members.find((item) => item.id === message.authorId) ?? members[0]

          if (!member) {
            return null
          }

          return (
            <article
              key={message.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.05]"
            >
              <div className="flex gap-3">
                <div
                  className={[
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white',
                    member.accent,
                  ].join(' ')}
                >
                  {member.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-white">{member.name}</span>
                    <span className="text-xs text-slate-500">@{member.handle}</span>
                    <span className="text-xs text-slate-500">{formatLongMessageTime(message.createdAt)}</span>
                  </div>

                  <p className="mt-2 max-h-[4.5rem] overflow-hidden text-sm leading-6 text-slate-200">
                    {message.content}
                  </p>

                  {message.reactions && message.reactions.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.reactions.map((reaction) => (
                        <span
                          key={`${message.id}-${reaction.emoji}`}
                          title={reaction.users.join(', ')}
                          className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#202225] px-2.5 py-1 text-xs font-semibold text-slate-200"
                        >
                          <span aria-hidden="true">{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onJump(message.id)}
                      className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.09]"
                    >
                      Jump
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemovePin(message.id)}
                      className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.09] hover:text-white"
                      aria-label="Unpin message"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function MemberAvatar({ member }: { member: ServerMemberView }) {
  const initials = member.displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative h-10 w-10 shrink-0">
      {member.avatarUrl ? (
        <img
          src={member.avatarUrl}
          alt={member.displayName}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div
          className={[
            'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white',
            member.accent,
          ].join(' ')}
        >
          {initials}
        </div>
      )}
      <span
        className={[
          'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#2b2d31]',
          getPresenceToneClass(member.presence),
        ].join(' ')}
        aria-hidden="true"
      />
    </div>
  )
}

function MemberListPanel({ members }: { members: ServerMemberView[] }) {
  const groupedMembers = groupMembersByPresence(members)

  return (
    <aside className="hidden w-[300px] shrink-0 border-l border-white/[0.06] bg-[#2b2d31] px-4 py-4 xl:flex xl:flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Members</p>
          <p className="text-xs text-slate-400">{members.length} anggota server</p>
        </div>
        <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
          Live
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {groupedMembers.map((group) => (
          <section key={group.status}>
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                {getPresenceLabel(group.status)}
              </p>
              <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                {group.members.length}
              </span>
            </div>

            <div className="space-y-1">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-white/[0.05]"
                >
                  <MemberAvatar member={member} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">{member.displayName}</p>
                      <span className="truncate text-xs text-slate-500">@{member.username}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className={['h-2 w-2 rounded-full', getPresenceToneClass(member.presence)].join(' ')} />
                      <span className="text-xs text-slate-400">{getPresenceLabel(member.presence)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  )
}

function MemberListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 18.5c.9-2.6 3-4 5.5-4s4.6 1.4 5.5 4m2.5-1.5c.5-1.7 1.8-2.8 3.5-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function mapChannelSnapshot(
  _workspace: ServerWorkspaceRecord,
  _channel: ServerChannelRecord,
  _members: ChatMember[],
): ChannelChatSnapshot {
  return {
    messages: [],
    draft: '',
    attachments: [],
    visibleCount: DEFAULT_VISIBLE_MESSAGE_COUNT,
    lastReadMessageId: null,
  }
}

const TYPING_HEARTBEAT_MS = 2500

function getEnvelopeObjectPayload(message: { payload?: unknown; data?: unknown }) {
  if (message.payload && typeof message.payload === 'object' && !Array.isArray(message.payload)) {
    return message.payload as Record<string, unknown>
  }

  if (message.data && typeof message.data === 'object' && !Array.isArray(message.data)) {
    return message.data as Record<string, unknown>
  }

  return null
}

function getReadReceiptMessageId(
  readState: { lastReadMessageId?: string | null; message?: { id?: string } | null } | null | undefined,
) {
  return readState?.lastReadMessageId ?? readState?.message?.id ?? null
}

function formatTypingLabel(names: string[]) {
  if (names.length === 0) {
    return null
  }

  if (names.length === 1) {
    return `${names[0]} sedang mengetik...`
  }

  if (names.length === 2) {
    return `${names[0]} dan ${names[1]} sedang mengetik...`
  }

  return `${names[0]}, ${names[1]} dan ${names.length - 2} orang lain sedang mengetik...`
}

export function ServerChatView({
  workspace,
  activeChannel,
}: {
  workspace: ServerWorkspaceRecord
  activeChannel: ServerChannelRecord
}) {
  const currentUser = useAuthStore((state) => state.user)
  const [searchParams] = useSearchParams()
  const realtime = useRealtimeConnection()
  const snapshotStoreRef = useRef<Record<string, ChannelChatSnapshot>>({})
  const jumpResetTimeoutRef = useRef<number | null>(null)
  const typingHeartbeatRef = useRef<number | null>(null)
  const typingDraftRef = useRef('')
  const typingActiveRef = useRef(false)
  const typingUserTimeoutsRef = useRef<Record<string, number>>({})
  const [version, setVersion] = useState(0)
  const [pinnedPanelOpen, setPinnedPanelOpen] = useState(false)
  const [memberListOpen, setMemberListOpen] = useState(true)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [presenceOverrides, setPresenceOverrides] = useState<Record<string, ChatMember['presence']>>({})
  const [typingUserIds, setTypingUserIds] = useState<string[]>([])

  const members = useMemo(
    () => createChatMembers(workspace.server.id, workspace.server.name, currentUser),
    [currentUser, workspace.server.id, workspace.server.name],
  )

  const channelKey = `${workspace.server.id}:${activeChannel.id}`
  const currentUserId = currentUser?.id ?? members[0]?.id ?? 'current-user'
  const routeMessageId = searchParams.get('messageId')

  const channelMessagesQuery = useQuery({
    queryKey: ['server-channel-messages', channelKey],
    queryFn: async () => {
      const response = await getChannelMessagesRequest(activeChannel.id, { limit: 100 })
      return response.data
    },
    enabled: Boolean(activeChannel.id),
  })

  const serverMembersQuery = useQuery({
    queryKey: ['server-members', workspace.server.id],
    queryFn: async () => {
      const response = await getServerMembersRequest(workspace.server.id)
      return response.data
    },
    enabled: Boolean(workspace.server.id),
    refetchInterval: 15_000,
  })

  const readReceiptQuery = useQuery({
    queryKey: ['channel-read-receipt', channelKey],
    queryFn: async () => {
      const response = await getChannelReadReceiptRequest(activeChannel.id)
      return response.data
    },
    enabled: Boolean(activeChannel.id),
  })

  useEffect(() => {
    setHighlightedMessageId(routeMessageId)
  }, [routeMessageId, activeChannel.id])

  useEffect(() => {
    const latestMessage = realtime.latestMessage

    if (!latestMessage || latestMessage.type !== 'presence.updated') {
      return
    }

    const payload = getEnvelopeObjectPayload(latestMessage)
    const userId = typeof payload?.userId === 'string' ? payload.userId : null
    const status =
      payload?.status === 'online' || payload?.status === 'idle' || payload?.status === 'dnd'
        ? payload.status
        : null

    if (!userId || !status) {
      return
    }

    setPresenceOverrides((current) => {
      if (current[userId] === status) {
        return current
      }

      return {
        ...current,
        [userId]: status,
      }
    })
  }, [realtime.latestMessage])

  const serverMembers = useMemo(() => {
    const membersFromServer = serverMembersQuery.data ?? []

    return membersFromServer
      .map((member) => {
        const mappedMember = mapServerMemberToView(member)
        const overriddenPresence = presenceOverrides[member.userId]

        return overriddenPresence
          ? {
              ...mappedMember,
              presence: overriddenPresence,
            }
          : mappedMember
      })
      .sort((left, right) => {
        const presenceOrder: Record<ChatMember['presence'], number> = {
          online: 0,
          idle: 1,
          dnd: 2,
          offline: 3,
        }

        const presenceDelta = presenceOrder[left.presence] - presenceOrder[right.presence]
        if (presenceDelta !== 0) {
          return presenceDelta
        }

        return left.displayName.localeCompare(right.displayName, 'id-ID')
      })
  }, [presenceOverrides, serverMembersQuery.data])

  const fallbackOwnerMember = useMemo(() => {
    const ownerMember = members.find((member) => member.id === `${workspace.server.id}-owner`) ?? members[0]

    return {
      id: ownerMember.id,
      displayName: ownerMember.name,
      username: ownerMember.handle,
      avatarUrl: null,
      presence: ownerMember.presence,
      accent: ownerMember.accent,
    } satisfies ServerMemberView
  }, [members, workspace.server.id])

  const memberListMembers = serverMembers.length > 0 ? serverMembers : [fallbackOwnerMember]
  const showMemberList = memberListOpen

  const snapshot = snapshotStoreRef.current[channelKey] ?? mapChannelSnapshot(
    workspace,
    activeChannel,
    members,
  )

  if (!snapshotStoreRef.current[channelKey]) {
    snapshotStoreRef.current[channelKey] = snapshot
  }

  const updateSnapshot = (updater: (current: ChannelChatSnapshot) => ChannelChatSnapshot) => {
    const current = snapshotStoreRef.current[channelKey] ?? snapshot
    snapshotStoreRef.current[channelKey] = updater(current)
    setVersion((currentVersion) => currentVersion + 1)
  }

  const visibleMessages = useMemo(() => {
    const startIndex = Math.max(0, snapshot.messages.length - snapshot.visibleCount)
    return snapshot.messages.slice(startIndex)
  }, [snapshot.messages, snapshot.visibleCount, version])

  const pinnedMessages = useMemo(
    () =>
      [...snapshot.messages]
        .filter((message) => message.isPinned)
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)),
    [snapshot.messages, version],
  )

  const mentionRange = getActiveMentionRange(snapshot.draft, snapshot.draft.length)
  const mentionQuery = mentionRange?.query ?? ''
  const hasOlderMessages = snapshot.visibleCount < snapshot.messages.length
  const currentUserLabel = currentUser?.name?.trim() || currentUser?.username?.trim() || 'You'
  const typingIndicatorLabel = useMemo(() => {
    const knownMembers = new Map<string, string>()

    for (const member of members) {
      knownMembers.set(member.id, member.name)
    }

    for (const member of memberListMembers) {
      knownMembers.set(member.id, member.displayName)
    }

    const names = typingUserIds
      .filter((userId) => userId !== currentUserId)
      .map((userId) => knownMembers.get(userId) ?? 'Seseorang')
      .filter((name, index, allNames) => allNames.indexOf(name) === index)

    return formatTypingLabel(names)
  }, [currentUserId, memberListMembers, members, typingUserIds])

  const clearTypingHeartbeat = () => {
    if (typingHeartbeatRef.current !== null) {
      window.clearInterval(typingHeartbeatRef.current)
      typingHeartbeatRef.current = null
    }
  }

  const resetTypingState = (channelId: string, shouldNotifyServer: boolean) => {
    if (!channelId) {
      typingActiveRef.current = false
      clearTypingHeartbeat()
      return
    }

    if (shouldNotifyServer && typingActiveRef.current && realtime.isConnected) {
      realtime.sendEvent('typing.stop', { channelId })
    }

    typingActiveRef.current = false
    clearTypingHeartbeat()
  }

  const ensureTypingHeartbeat = (channelId: string) => {
    if (typingHeartbeatRef.current !== null) {
      return
    }

    typingHeartbeatRef.current = window.setInterval(() => {
      if (!typingDraftRef.current.trim()) {
        resetTypingState(channelId, true)
        return
      }

      realtime.sendEvent('typing.start', { channelId })
    }, TYPING_HEARTBEAT_MS)
  }

  useEffect(() => {
    const nextMessageId = getReadReceiptMessageId(readReceiptQuery.data)

    updateSnapshot((current) => {
      if (current.lastReadMessageId === nextMessageId) {
        return current
      }

      return {
        ...current,
        lastReadMessageId: nextMessageId,
      }
    })
  }, [readReceiptQuery.data])

  useEffect(() => {
    const channelId = activeChannel.id

    if (!channelId || !realtime.isConnected) {
      return undefined
    }

    realtime.sendEvent('subscribe', { channelId })

    return () => {
      resetTypingState(channelId, true)
      setTypingUserIds([])

      for (const timeoutId of Object.values(typingUserTimeoutsRef.current)) {
        window.clearTimeout(timeoutId)
      }
      typingUserTimeoutsRef.current = {}

      realtime.sendEvent('unsubscribe', { channelId })
    }
  }, [activeChannel.id, realtime.isConnected])

  useEffect(() => {
    const channelId = activeChannel.id
    typingDraftRef.current = snapshot.draft

    if (!channelId || !realtime.isConnected) {
      resetTypingState(channelId ?? '', true)
      return undefined
    }

    const hasDraft = snapshot.draft.trim().length > 0

    if (!hasDraft) {
      resetTypingState(channelId, true)
      return undefined
    }

    if (!typingActiveRef.current) {
      if (realtime.sendEvent('typing.start', { channelId })) {
        typingActiveRef.current = true
      }
    }

    ensureTypingHeartbeat(channelId)

    return undefined
  }, [activeChannel.id, realtime.isConnected, snapshot.draft])

  useEffect(() => {
    const channelId = activeChannel.id
    const latestVisibleMessage = visibleMessages[visibleMessages.length - 1]

    if (!channelId || !realtime.isConnected || !channelMessagesQuery.data?.length || !latestVisibleMessage) {
      return
    }

    if (snapshot.lastReadMessageId === latestVisibleMessage.id) {
      return
    }

    let cancelled = false

    void updateChannelReadReceiptRequest(channelId, latestVisibleMessage.id)
      .then((response) => {
        if (cancelled) {
          return
        }

        const nextMessageId = getReadReceiptMessageId(response.data)

        updateSnapshot((current) => {
          if (current.lastReadMessageId === nextMessageId) {
            return current
          }

          return {
            ...current,
            lastReadMessageId: nextMessageId,
          }
        })
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [activeChannel.id, channelMessagesQuery.data, realtime.isConnected, snapshot.lastReadMessageId, visibleMessages])

  useEffect(() => {
    const channelId = activeChannel.id

    if (!channelId || !realtime.isConnected) {
      return undefined
    }

    const typingStartSubscription = realtime.subscribe('typing.start', (message) => {
      const payload = getEnvelopeObjectPayload(message)
      const payloadChannelId = typeof payload?.channelId === 'string' ? payload.channelId : null
      const userId = typeof payload?.userId === 'string' ? payload.userId : null

      if (!payloadChannelId || payloadChannelId !== channelId || !userId || userId === currentUserId) {
        return
      }

      setTypingUserIds((current) => (current.includes(userId) ? current : [...current, userId]))

      const existingTimeout = typingUserTimeoutsRef.current[userId]
      if (existingTimeout) {
        window.clearTimeout(existingTimeout)
      }

      typingUserTimeoutsRef.current[userId] = window.setTimeout(() => {
        setTypingUserIds((current) => current.filter((item) => item !== userId))
        delete typingUserTimeoutsRef.current[userId]
      }, 3200)
    })

    const typingStopSubscription = realtime.subscribe('typing.stop', (message) => {
      const payload = getEnvelopeObjectPayload(message)
      const payloadChannelId = typeof payload?.channelId === 'string' ? payload.channelId : null
      const userId = typeof payload?.userId === 'string' ? payload.userId : null

      if (!payloadChannelId || payloadChannelId !== channelId || !userId || userId === currentUserId) {
        return
      }

      const existingTimeout = typingUserTimeoutsRef.current[userId]
      if (existingTimeout) {
        window.clearTimeout(existingTimeout)
        delete typingUserTimeoutsRef.current[userId]
      }

      setTypingUserIds((current) => current.filter((item) => item !== userId))
    })

    const readReceiptSubscription = realtime.subscribe('read.receipt.updated', (message) => {
      const payload = getEnvelopeObjectPayload(message)
      const payloadChannelId = typeof payload?.channelId === 'string' ? payload.channelId : null
      const userId = typeof payload?.userId === 'string' ? payload.userId : null
      const messageId = typeof payload?.messageId === 'string' ? payload.messageId : null

      if (!payloadChannelId || payloadChannelId !== channelId || !messageId || userId !== currentUserId) {
        return
      }

      updateSnapshot((current) => {
        if (current.lastReadMessageId === messageId) {
          return current
        }

        return {
          ...current,
          lastReadMessageId: messageId,
        }
      })
    })

    const messageCreatedSubscription = realtime.subscribe('message.created', (message) => {
      const payload = getEnvelopeObjectPayload(message)
      const payloadChannelId = typeof payload?.channelId === 'string' ? payload.channelId : null

      if (!payloadChannelId || payloadChannelId !== channelId) {
        return
      }

      const incomingMessage = mapMessageRecordToChatMessage(payload as MessageRecord, 'sent')

      updateSnapshot((current) => {
        const existingIndex = current.messages.findIndex((item) => item.id === incomingMessage.id)
        if (existingIndex !== -1) {
          return {
            ...current,
            messages: current.messages.map((item) =>
              item.id === incomingMessage.id ? incomingMessage : item,
            ),
          }
        }

        return {
          ...current,
          messages: sortMessagesByCreatedAt([...current.messages, incomingMessage]),
          visibleCount: Math.max(current.visibleCount, DEFAULT_VISIBLE_MESSAGE_COUNT),
        }
      })
    })

    return () => {
      typingStartSubscription.unsubscribe()
      typingStopSubscription.unsubscribe()
      readReceiptSubscription.unsubscribe()
      messageCreatedSubscription.unsubscribe()
    }
  }, [activeChannel.id, currentUserId, realtime.isConnected, realtime.subscribe])

  useEffect(() => {
    const serverMessages = channelMessagesQuery.data

    if (!serverMessages?.length) {
      return
    }

    const normalizedMessages = sortMessagesByCreatedAt(
      serverMessages.map((record) => mapMessageRecordToChatMessage(record, 'sent')),
    )

    updateSnapshot((current) => {
      const serverIds = new Set(normalizedMessages.map((message) => message.id))
      const preservedLocalMessages = current.messages.filter(
        (message) =>
          !serverIds.has(message.id) &&
          (message.status === 'sending' || message.status === 'failed' || message.id.startsWith('message-')),
      )

      return {
        ...current,
        messages: sortMessagesByCreatedAt([...normalizedMessages, ...preservedLocalMessages]),
      }
    })
  }, [channelMessagesQuery.data])

  useEffect(() => {
    const serverMessages = channelMessagesQuery.data

    if (!serverMessages?.length) {
      return
    }

    let cancelled = false

    const hydrateReactions = async () => {
      const reactionEntries: Array<readonly [string, ChatMessage['reactions']]> = await Promise.all(
        serverMessages.map(async (message) => {
          try {
            const response = await getMessageReactionsRequest(message.id)
            return [message.id, mapReactionRecordsToChatReactions(response.data, currentUserId)] as const
          } catch {
            return [message.id, [] as ChatMessage['reactions']] as const
          }
        }),
      )

      if (cancelled) {
        return
      }

      const reactionsByMessageId = new Map(reactionEntries)

      updateSnapshot((current) => ({
        ...current,
        messages: current.messages.map((message) =>
          reactionsByMessageId.has(message.id)
            ? { ...message, reactions: reactionsByMessageId.get(message.id) ?? [] }
            : message,
        ),
      }))
    }

    hydrateReactions().catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [channelMessagesQuery.data, currentUserId])

  useEffect(() => {
    if (!pinnedMessages.length) {
      setPinnedPanelOpen(false)
    }
  }, [pinnedMessages.length])

  useEffect(
    () => () => {
      if (jumpResetTimeoutRef.current) {
        window.clearTimeout(jumpResetTimeoutRef.current)
      }
    },
    [],
  )

  const handleLoadOlderMessages = () => {
    updateSnapshot((current) => ({
      ...current,
      visibleCount: Math.min(current.messages.length, current.visibleCount + 6),
    }))
  }

  const handleJumpToMessage = (messageId: string) => {
    updateSnapshot((current) => ({
      ...current,
      visibleCount: current.messages.length,
    }))

    setPinnedPanelOpen(false)
    setHighlightedMessageId(messageId)

    if (jumpResetTimeoutRef.current) {
      window.clearTimeout(jumpResetTimeoutRef.current)
    }

    jumpResetTimeoutRef.current = window.setTimeout(() => {
      setHighlightedMessageId(null)
    }, 1800)
  }

  const handleTogglePin = async (messageId: string) => {
    const currentMessage = snapshot.messages.find((message) => message.id === messageId)
    if (!currentMessage) {
      return
    }

    const nextPinned = !currentMessage.isPinned
    updateSnapshot((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.id === messageId ? { ...message, isPinned: nextPinned } : message,
      ),
    }))

    if (nextPinned) {
      setPinnedPanelOpen(true)
    }

    try {
      const response = nextPinned ? await pinMessageRequest(messageId) : await unpinMessageRequest(messageId)
      const updatedMessage = mapMessageRecordToChatMessage(
        response.data,
        currentMessage.status,
        currentMessage.reactions,
      )

      updateSnapshot((current) => ({
        ...current,
        messages: current.messages.map((message) => (message.id === messageId ? updatedMessage : message)),
      }))
    } catch {
      updateSnapshot((current) => ({
        ...current,
        messages: current.messages.map((message) =>
          message.id === messageId ? { ...message, isPinned: currentMessage.isPinned } : message,
        ),
      }))
    }
  }

  const handleRemovePin = async (messageId: string) => {
    const currentMessage = snapshot.messages.find((message) => message.id === messageId)
    if (!currentMessage || !currentMessage.isPinned) {
      return
    }

    updateSnapshot((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.id === messageId ? { ...message, isPinned: false } : message,
      ),
    }))

    try {
      const response = await unpinMessageRequest(messageId)
      const updatedMessage = mapMessageRecordToChatMessage(response.data, currentMessage.status, currentMessage.reactions)

      updateSnapshot((current) => ({
        ...current,
        messages: current.messages.map((message) => (message.id === messageId ? updatedMessage : message)),
      }))
    } catch {
      updateSnapshot((current) => ({
        ...current,
        messages: current.messages.map((message) =>
          message.id === messageId ? { ...message, isPinned: true } : message,
        ),
      }))
    }
  }

  const refreshMessageReactions = async (messageId: string) => {
    const reactionResponse = await getMessageReactionsRequest(messageId)
    const nextReactions = mapReactionRecordsToChatReactions(reactionResponse.data, currentUserId)

    updateSnapshot((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.id === messageId ? { ...message, reactions: nextReactions } : message,
      ),
    }))
  }

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    const currentMessage = snapshot.messages.find((message) => message.id === messageId)
    if (!currentMessage) {
      return
    }

    const existingReaction = currentMessage.reactions?.find(
      (reaction) => reaction.emoji === emoji && reaction.reactedByCurrentUser,
    )
    const shouldRemove = Boolean(existingReaction)
    const previousMessage = currentMessage

    updateSnapshot((current) => ({
      ...current,
      messages: current.messages.map((message) => {
        if (message.id !== messageId) {
          return message
        }

        const reactions = [...(message.reactions ?? [])]
        const reactionIndex = reactions.findIndex((reaction) => reaction.emoji === emoji)

        if (reactionIndex === -1) {
          reactions.unshift({
            emoji,
            count: 1,
            users: [currentUserLabel],
            reactedByCurrentUser: true,
          })

          return { ...message, reactions }
        }

        const existing = reactions[reactionIndex]

        if (shouldRemove) {
          const nextCount = Math.max(0, existing.count - 1)

          if (nextCount <= 0) {
            reactions.splice(reactionIndex, 1)
          } else {
            reactions[reactionIndex] = {
              ...existing,
              count: nextCount,
              reactedByCurrentUser: false,
              users: existing.users.filter((user) => user !== currentUserLabel),
            }
          }
        } else {
          reactions[reactionIndex] = {
            ...existing,
            count: existing.count + 1,
            reactedByCurrentUser: true,
            users: Array.from(new Set([...existing.users, currentUserLabel])),
          }
        }

        return { ...message, reactions }
      }),
    }))

    try {
      if (shouldRemove) {
        await removeMessageReactionRequest(messageId, emoji)
      } else {
        await addMessageReactionRequest(messageId, emoji)
      }

      await refreshMessageReactions(messageId)
    } catch {
      updateSnapshot((current) => ({
        ...current,
        messages: current.messages.map((message) =>
          message.id === messageId ? previousMessage : message,
        ),
      }))
    }
  }

  const handleSend = async () => {
    const trimmedDraft = snapshot.draft.trim()
    const hasAttachments = snapshot.attachments.length > 0

    if (!trimmedDraft && !hasAttachments) {
      return
    }

    const optimisticId = createId('message')
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      authorId: currentUser?.id ?? members[0]?.id ?? 'current-user',
      content: trimmedDraft || 'Attachment only',
      createdAt: new Date().toISOString(),
      status: 'sending',
      attachments: hasAttachments ? snapshot.attachments : undefined,
    }

    updateSnapshot((current) => ({
      ...current,
      messages: [...current.messages, optimisticMessage],
      draft: '',
      attachments: [],
      visibleCount: Math.min(current.messages.length + 1, Math.max(current.visibleCount, DEFAULT_VISIBLE_MESSAGE_COUNT)),
    }))

    if (hasAttachments) {
      window.setTimeout(() => {
        const shouldFail = trimmedDraft.toLowerCase().includes('fail')

        updateSnapshot((current) => ({
          ...current,
          messages: current.messages.map((message) =>
            message.id === optimisticId ? { ...message, status: shouldFail ? 'failed' : 'sent' } : message,
          ),
        }))
      }, 900)

      return
    }

    try {
      const response = await createChannelMessageRequest(activeChannel.id, {
        content: trimmedDraft,
      })

      const createdMessage = mapMessageRecordToChatMessage(response.data, 'sent')

      updateSnapshot((current) => ({
        ...current,
        messages: current.messages.some((message) => message.id === createdMessage.id)
          ? current.messages.filter((message) => message.id !== optimisticId || message.id === createdMessage.id)
          : current.messages.map((message) => (message.id === optimisticId ? createdMessage : message)),
      }))
    } catch {
      updateSnapshot((current) => ({
        ...current,
        messages: current.messages.map((message) =>
          message.id === optimisticId ? { ...message, status: 'failed' } : message,
        ),
      }))
    }
  }

  const handleRetry = async (messageId: string) => {
    const failedMessage = snapshot.messages.find((message) => message.id === messageId)
    if (!failedMessage) {
      return
    }

    updateSnapshot((current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.id === messageId ? { ...message, status: 'sending' } : message,
      ),
    }))

    if (failedMessage.attachments && failedMessage.attachments.length > 0) {
      window.setTimeout(() => {
        updateSnapshot((current) => ({
          ...current,
          messages: current.messages.map((message) =>
            message.id === messageId ? { ...message, status: 'sent' } : message,
          ),
        }))
      }, 700)

      return
    }

    try {
      const response = await createChannelMessageRequest(activeChannel.id, {
        content: failedMessage.content,
      })

      const createdMessage = mapMessageRecordToChatMessage(response.data, 'sent')

      updateSnapshot((current) => ({
        ...current,
        messages: current.messages.some((message) => message.id === createdMessage.id)
          ? current.messages.filter((message) => message.id !== messageId || message.id === createdMessage.id)
          : current.messages.map((message) => (message.id === messageId ? createdMessage : message)),
      }))
    } catch {
      updateSnapshot((current) => ({
        ...current,
        messages: current.messages.map((message) =>
          message.id === messageId ? { ...message, status: 'failed' } : message,
        ),
      }))
    }
  }

  const handleAttachFiles = (files: FileList | File[]) => {
    const nextAttachments = Array.from(files).map((file) => toAttachmentPreview(file))

    updateSnapshot((current) => ({
      ...current,
      attachments: [...current.attachments, ...nextAttachments],
    }))
  }

  const handlePickMention = (member: ChatMember) => {
    const mention = `@${member.handle} `

    if (!mentionRange) {
      updateSnapshot((current) => ({
        ...current,
        draft: `${current.draft}${mention}`,
      }))
      return
    }

    const nextDraft = `${snapshot.draft.slice(0, mentionRange.start)}${mention}${snapshot.draft.slice(
      mentionRange.end,
    )}`

    updateSnapshot((current) => ({
      ...current,
      draft: nextDraft,
    }))
  }

  const handleDraftChange = (value: string) => {
    updateSnapshot((current) => ({
      ...current,
      draft: value,
    }))
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    updateSnapshot((current) => ({
      ...current,
      attachments: current.attachments.filter((attachment) => attachment.id !== attachmentId),
    }))
  }

  return (
    <section className="relative flex min-w-0 flex-1 flex-col bg-[#36393F]">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="rounded-xl bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-200">
            #{workspace.server.name}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-white">#{activeChannel.name}</h1>
            <p className="truncate text-sm text-slate-400">
              {activeChannel.topic ?? 'Channel terbuka untuk percakapan server.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMemberListOpen((current) => !current)}
            className={[
              'group inline-flex h-10 w-10 items-center justify-center rounded-full border transition',
              memberListOpen
                ? 'border-white/[0.08] bg-white/[0.08] text-white hover:bg-white/[0.12]'
                : 'border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white',
            ].join(' ')}
            aria-label={memberListOpen ? 'Hide member list' : 'Show member list'}
            title={memberListOpen ? 'Hide Member List' : 'Show Member List'}
          >
            <MemberListIcon />
          </button>

          <button
            type="button"
            onClick={() => setPinnedPanelOpen((current) => !current)}
            className={[
              'relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition',
              pinnedPanelOpen
                ? 'border-[#5865F2]/30 bg-[#5865F2]/18 text-[#d8ddff]'
                : 'border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white',
            ].join(' ')}
            aria-label="Open pinned messages"
          >
            <PinIcon filled={pinnedPanelOpen} />
            <span className="absolute -right-1 -top-1 rounded-full bg-[#5865F2] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {pinnedMessages.length}
            </span>
          </button>
        </div>
      </header>

      {pinnedPanelOpen ? (
        <PinnedMessagesPanel
          messages={pinnedMessages}
          members={members}
          onJump={handleJumpToMessage}
          onRemovePin={handleRemovePin}
          onClose={() => setPinnedPanelOpen(false)}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 overflow-hidden px-4 py-4 lg:px-6">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-4 rounded-[28px] border border-white/[0.06] bg-[linear-gradient(135deg,rgba(88,101,242,0.18),rgba(0,0,0,0.08))] px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">ChatView</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              MessageList mengelompokkan pesan dari user yang sama, composer mendukung mention popup, dan
              scroll ke atas memuat history lama tanpa menggeser posisi baca.
            </p>
          </div>

          <MessageList
            scrollKey={channelKey}
            messages={visibleMessages}
            members={members}
            hasOlderMessages={hasOlderMessages}
            onLoadOlderMessages={handleLoadOlderMessages}
            highlightedMessageId={highlightedMessageId}
            readReceiptMessageId={snapshot.lastReadMessageId}
            onJumpToMessage={handleJumpToMessage}
            onTogglePin={handleTogglePin}
            onReact={handleReactToMessage}
            onRetryMessage={handleRetry}
          />

          <div className="mt-4">
            {typingIndicatorLabel ? (
              <div className="mb-3 flex items-center gap-2 px-2 text-xs text-slate-400" aria-live="polite">
                <span className="h-2 w-2 rounded-full bg-[#5865F2] animate-pulse" />
                <span>{typingIndicatorLabel}</span>
              </div>
            ) : null}

            <MessageComposer
              draft={snapshot.draft}
              attachments={snapshot.attachments}
              members={members}
              mentionRange={mentionRange}
              mentionQuery={mentionQuery}
              onDraftChange={handleDraftChange}
              onSubmit={handleSend}
              onAttachFiles={handleAttachFiles}
              onPickMention={handlePickMention}
              onRemoveAttachment={handleRemoveAttachment}
            />
          </div>
        </div>

        {showMemberList ? <MemberListPanel members={memberListMembers} /> : null}
      </div>
    </section>
  )
}

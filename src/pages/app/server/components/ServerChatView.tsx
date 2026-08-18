import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../../../state/auth.state'
import type { ServerChannelRecord, ServerWorkspaceRecord } from '../../../../lib/server/server-workspace.api'
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
  createChatMembers,
  createId,
  createSeedMessages,
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

function mapChannelSnapshot(
  workspace: ServerWorkspaceRecord,
  channel: ServerChannelRecord,
  members: ChatMember[],
  currentUserId: string,
): ChannelChatSnapshot {
  const seedMessages = createSeedMessages(channel.id, workspace.server.name, channel.name, members, currentUserId)

  return {
    messages: seedMessages,
    draft: '',
    attachments: [],
    visibleCount: Math.min(DEFAULT_VISIBLE_MESSAGE_COUNT, seedMessages.length),
  }
}

export function ServerChatView({
  workspace,
  activeChannel,
}: {
  workspace: ServerWorkspaceRecord
  activeChannel: ServerChannelRecord
}) {
  const currentUser = useAuthStore((state) => state.user)
  const snapshotStoreRef = useRef<Record<string, ChannelChatSnapshot>>({})
  const jumpResetTimeoutRef = useRef<number | null>(null)
  const [version, setVersion] = useState(0)
  const [pinnedPanelOpen, setPinnedPanelOpen] = useState(false)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)

  const members = useMemo(
    () => createChatMembers(workspace.server.id, workspace.server.name, currentUser),
    [currentUser, workspace.server.id, workspace.server.name],
  )

  const channelKey = `${workspace.server.id}:${activeChannel.id}`
  const currentUserId = currentUser?.id ?? members[0]?.id ?? 'current-user'

  const channelMessagesQuery = useQuery({
    queryKey: ['server-channel-messages', channelKey],
    queryFn: async () => {
      const response = await getChannelMessagesRequest(activeChannel.id, { limit: 100 })
      return response.data
    },
    enabled: Boolean(activeChannel.id),
  })

  const snapshot = snapshotStoreRef.current[channelKey] ?? mapChannelSnapshot(
    workspace,
    activeChannel,
    members,
    currentUserId,
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
      const reactionEntries = await Promise.all(
        serverMessages.map(async (message) => {
          try {
            const response = await getMessageReactionsRequest(message.id)
            return [message.id, mapReactionRecordsToChatReactions(response.data, currentUserId)] as const
          } catch {
            return [message.id, []] as const
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
        messages: current.messages.map((message) => (message.id === optimisticId ? createdMessage : message)),
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
        messages: current.messages.map((message) => (message.id === messageId ? createdMessage : message)),
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

      <div className="flex min-h-0 flex-1 flex-col px-4 py-4 lg:px-6">
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
          onJumpToMessage={handleJumpToMessage}
          onTogglePin={handleTogglePin}
          onReact={handleReactToMessage}
          onRetryMessage={handleRetry}
        />

        <div className="mt-4">
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
    </section>
  )
}

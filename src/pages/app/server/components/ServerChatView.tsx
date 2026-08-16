import { useMemo, useRef, useState } from 'react'
import { useAuthStore } from '../../../../state/auth.state'
import type { ServerChannelRecord, ServerWorkspaceRecord } from '../../../../lib/server/server-workspace.api'
import { createChannelMessageRequest, type MessageRecord } from '../../../../lib/message/message.api'
import {
  createChatMembers,
  createId,
  createSeedMessages,
  DEFAULT_VISIBLE_MESSAGE_COUNT,
  formatFileSize,
  getActiveMentionRange,
  toAttachmentPreview,
} from './chat/chat.utils'
import type { ChatMember, ChatMessage, ChannelChatSnapshot } from './chat/chat.types'
import { MessageComposer } from './chat/MessageComposer'
import { MessageList } from './chat/MessageList'

function mapMessageRecordToChatMessage(record: MessageRecord, status: ChatMessage['status'] = 'sent'): ChatMessage {
  return {
    id: record.id,
    authorId: record.authorId,
    content: record.content,
    createdAt: record.createdAt,
    status,
    attachments: record.attachments?.map((attachment) => ({
      id: attachment.id,
      name: attachment.fileName,
      sizeLabel: formatFileSize(Number(attachment.fileSize)),
    })),
  }
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
  const [version, setVersion] = useState(0)

  const members = useMemo(
    () => createChatMembers(workspace.server.id, workspace.server.name, currentUser),
    [currentUser, workspace.server.id, workspace.server.name],
  )

  const channelKey = `${workspace.server.id}:${activeChannel.id}`

  const snapshot = snapshotStoreRef.current[channelKey] ?? mapChannelSnapshot(
    workspace,
    activeChannel,
    members,
    currentUser?.id ?? members[0]?.id ?? 'current-user',
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

  const mentionRange = getActiveMentionRange(snapshot.draft, snapshot.draft.length)
  const mentionQuery = mentionRange?.query ?? ''
  const hasOlderMessages = snapshot.visibleCount < snapshot.messages.length

  const handleLoadOlderMessages = () => {
    updateSnapshot((current) => ({
      ...current,
      visibleCount: Math.min(current.messages.length, current.visibleCount + 6),
    }))
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
    <section className="flex min-w-0 flex-1 flex-col bg-[#36393F]">
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

        <div className="hidden rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-slate-300 xl:block">
          ChatView ready
        </div>
      </header>

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

import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ChatMember, ChatMessage } from './chat.types'
import { formatMessageTime, getPresenceTone } from './chat.utils'

function PresenceDot({ state }: { state: ChatMember['presence'] }) {
  return (
    <span
      className={[
        'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#36393F]',
        getPresenceTone(state),
      ].join(' ')}
      aria-hidden="true"
    />
  )
}

function Avatar({ member }: { member: ChatMember }) {
  return (
    <div className="relative h-10 w-10 shrink-0">
      <div
        className={[
          'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white',
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
      <PresenceDot state={member.presence} />
    </div>
  )
}

function RetryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M20 12a8 8 0 10-2.3 5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 7v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M20 7L10 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EmojiButton({ emoji }: { emoji: string }) {
  return <span aria-hidden="true">{emoji}</span>
}

function statusTone(status: ChatMessage['status']) {
  return {
    sending: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    sent: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    failed: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
  }[status]
}

function statusLabel(status: ChatMessage['status']) {
  return {
    sending: 'sending',
    sent: 'sent',
    failed: 'failed',
  }[status]
}

function formatMessageContent(content: string, members: ChatMember[]) {
  const memberByHandle = new Map(members.map((member) => [member.handle.toLowerCase(), member] as const))
  const parts: ReactNode[] = []
  const pattern = /(@[a-zA-Z0-9_.-]+)/g
  let lastIndex = 0

  for (const match of content.matchAll(pattern)) {
    const token = match[0]
    const index = match.index ?? 0

    if (index > lastIndex) {
      parts.push(content.slice(lastIndex, index))
    }

    const handle = token.slice(1).toLowerCase()
    const member = memberByHandle.get(handle)

    parts.push(
      <span
        key={`${token}-${index}`}
        className={member ? 'rounded bg-[#5865F2]/20 px-1 text-[#cdd4ff]' : 'text-[#cdd4ff]'}
      >
        {token}
      </span>,
    )

    lastIndex = index + token.length
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return parts.length > 0 ? parts : content
}

export function MessageItem({
  message,
  member,
  members,
  isHighlighted,
  onJump,
  onTogglePin,
  onReact,
  onRetry,
  readReceiptMessageId,
}: {
  message: ChatMessage
  member: ChatMember
  members: ChatMember[]
  isHighlighted?: boolean
  readReceiptMessageId: string | null
  onJump: (messageId: string) => void
  onTogglePin: (messageId: string) => void
  onReact: (messageId: string, emoji: string) => void
  onRetry: (messageId: string) => void
}) {
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false)
  const containerRef = useRef<HTMLElement | null>(null)
  const quickReactions = ['👍', '❤️', '😂', '🔥']
  const fullReactions = ['👍', '❤️', '😂', '🔥', '🎉', '👀', '✨', '😮', '🙏', '✅', '💡', '🫶']

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!containerRef.current) {
        return
      }

      if (event.target instanceof Node && !containerRef.current.contains(event.target)) {
        setReactionPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [])

  return (
    <article
      ref={containerRef}
      id={`message-${message.id}`}
      className={[
        'group relative scroll-mt-6 rounded-2xl border px-4 py-3 transition',
        isHighlighted
          ? 'border-[#5865F2]/50 bg-[#5865F2]/14 shadow-[0_0_0_1px_rgba(88,101,242,0.32),0_12px_40px_rgba(0,0,0,0.16)]'
          : 'border-white/[0.05] bg-white/[0.03] hover:bg-white/[0.05]',
      ].join(' ')}
    >
      {message.isPinned ? (
        <button
          type="button"
          onClick={() => onJump(message.id)}
          className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-[#5865F2]/30 bg-[#5865F2]/18 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8ddff] opacity-0 transition hover:bg-[#5865F2]/28 group-hover:opacity-100"
        >
          <SparkIcon />
          Jump
        </button>
      ) : null}

      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <div className="relative">
          <button
            type="button"
            onClick={() => setReactionPickerOpen((current) => !current)}
            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#1f2125] text-sm text-slate-100 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#2a2d33]"
            aria-label="Open reaction picker"
            aria-expanded={reactionPickerOpen}
          >
            <EmojiButton emoji="😊" />
          </button>

          {reactionPickerOpen ? (
            <div className="absolute right-0 top-10 z-20 w-64 rounded-2xl border border-white/[0.08] bg-[#2b2d31] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              <div className="grid grid-cols-4 gap-2">
                {quickReactions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onReact(message.id, emoji)
                      setReactionPickerOpen(false)
                    }}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-lg transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
                    aria-label={`React with ${emoji}`}
                  >
                    <EmojiButton emoji={emoji} />
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-6 gap-2">
                {fullReactions.map((emoji) => (
                  <button
                    key={`${message.id}-${emoji}`}
                    type="button"
                    onClick={() => {
                      onReact(message.id, emoji)
                      setReactionPickerOpen(false)
                    }}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.06] bg-[#202225] text-base transition hover:-translate-y-0.5 hover:bg-white/[0.08]"
                    aria-label={`React with ${emoji}`}
                  >
                    <EmojiButton emoji={emoji} />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onTogglePin(message.id)}
          className={[
            'grid h-8 w-8 place-items-center rounded-full border text-sm transition hover:-translate-y-0.5',
            message.isPinned
              ? 'border-[#5865F2]/30 bg-[#5865F2]/20 text-[#d8ddff] hover:bg-[#5865F2]/30'
              : 'border-white/10 bg-[#1f2125] text-slate-200 hover:border-white/20 hover:bg-[#2a2d33]',
          ].join(' ')}
          aria-label={message.isPinned ? 'Unpin message' : 'Pin message'}
        >
          <PinIcon filled={Boolean(message.isPinned)} />
        </button>
      </div>

      <div className="flex items-start gap-3">
        <Avatar member={member} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 pr-24">
            <span className="text-sm font-semibold text-white">{member.name}</span>
            <span className="text-xs text-slate-500">@{member.handle}</span>
            <span className="text-xs text-slate-500">{formatMessageTime(message.createdAt)}</span>
            <span
              className={[
                'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em]',
                statusTone(message.status),
              ].join(' ')}
            >
              {statusLabel(message.status)}
            </span>
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
            {formatMessageContent(message.content, members)}
          </p>

          {message.attachments && message.attachments.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#202225] text-xs text-slate-300"
                >
                  {attachment.fileType?.startsWith('image/') && attachment.thumbnailUrl ? (
                    <img
                      src={attachment.thumbnailUrl}
                      alt={attachment.name}
                      className="h-28 w-44 object-cover"
                    />
                  ) : null}

                  <div className="px-3 py-2">
                    <div className="font-semibold text-white">{attachment.name}</div>
                    <div className="mt-0.5 text-slate-500">{attachment.sizeLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {message.reactions && message.reactions.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.reactions.map((reaction) => (
                <button
                  key={`${message.id}-${reaction.emoji}`}
                  type="button"
                  onClick={() => onReact(message.id, reaction.emoji)}
                  title={reaction.users.join(', ')}
                  className={[
                    'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition',
                    reaction.reactedByCurrentUser
                      ? 'border-[#5865F2]/45 bg-[#5865F2]/16 text-[#dde2ff]'
                      : 'border-white/[0.08] bg-[#202225] text-slate-200 hover:border-white/[0.14] hover:bg-[#2b2f36]',
                  ].join(' ')}
                >
                  <span aria-hidden="true">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          ) : null}

          {message.status === 'failed' ? (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs text-rose-200">Gagal terkirim. Coba kirim ulang dari UI.</span>
              <button
                type="button"
                onClick={() => onRetry(message.id)}
                className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-400/20"
              >
                <RetryIcon />
                Retry
              </button>
            </div>
          ) : null}

          {readReceiptMessageId === message.id ? (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-100">
              <CheckIcon />
              Dibaca
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

import type { ReactNode } from 'react'
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
  onRetry,
}: {
  message: ChatMessage
  member: ChatMember
  members: ChatMember[]
  onRetry: (messageId: string) => void
}) {
  return (
    <article className="group rounded-2xl border border-white/[0.05] bg-white/[0.03] px-4 py-3 transition hover:bg-white/[0.05]">
      <div className="flex items-start gap-3">
        <Avatar member={member} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
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
                  className="rounded-2xl border border-white/[0.08] bg-[#202225] px-3 py-2 text-xs text-slate-300"
                >
                  <div className="font-semibold text-white">{attachment.name}</div>
                  <div className="mt-0.5 text-slate-500">{attachment.sizeLabel}</div>
                </div>
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
        </div>
      </div>
    </article>
  )
}


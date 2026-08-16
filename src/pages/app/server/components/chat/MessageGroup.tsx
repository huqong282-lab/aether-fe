import type { ChatMember, ChatMessageGroup } from './chat.types'
import { MessageItem } from './MessageItem'

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
      <span
        className={[
          'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#36393F]',
          {
            online: 'bg-[#3BA55D]',
            idle: 'bg-[#FAA61A]',
            dnd: 'bg-[#ED4245]',
            offline: 'bg-[#747F8D]',
          }[member.presence],
        ].join(' ')}
        aria-hidden="true"
      />
    </div>
  )
}

export function MessageGroup({
  group,
  members,
  onRetry,
}: {
  group: ChatMessageGroup
  members: ChatMember[]
  onRetry: (messageId: string) => void
}) {
  const member = members.find((item) => item.id === group.authorId) ?? members[0]

  if (!member) {
    return null
  }

  return (
    <section className="rounded-[28px] border border-white/[0.05] bg-[#2f3136]/60 p-4 shadow-[0_14px_45px_rgba(0,0,0,0.12)]">
      <div className="mb-3 flex items-center gap-3">
        <Avatar member={member} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{member.name}</p>
          <p className="text-xs text-slate-500">@{member.handle}</p>
        </div>
      </div>

      <div className="space-y-3 pl-[52px]">
        {group.messages.map((message) => (
          <MessageItem key={message.id} message={message} member={member} members={members} onRetry={onRetry} />
        ))}
      </div>
    </section>
  )
}


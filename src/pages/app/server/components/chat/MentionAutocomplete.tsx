import type { ChatMember } from './chat.types'

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

export function MentionAutocomplete({
  query,
  members,
  onPick,
}: {
  query: string
  members: ChatMember[]
  onPick: (member: ChatMember) => void
}) {
  const normalizedQuery = query.trim().toLowerCase()
  const filteredMembers = !normalizedQuery
    ? members.slice(0, 5)
    : members
        .filter((member) => {
          const haystack = `${member.name} ${member.handle}`.toLowerCase()
          return haystack.includes(normalizedQuery)
        })
        .slice(0, 6)

  if (filteredMembers.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-[#202225] px-4 py-3 text-sm text-slate-400 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        Tidak ada member yang cocok untuk <span className="font-semibold text-white">@{query}</span>.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#202225] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Mention members</p>
      </div>

      <div className="max-h-72 overflow-y-auto p-2">
        {filteredMembers.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => onPick(member)}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.06]"
          >
            <Avatar member={member} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{member.name}</p>
              <p className="truncate text-xs text-slate-400">@{member.handle}</p>
            </div>
            <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
              {member.presence}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}


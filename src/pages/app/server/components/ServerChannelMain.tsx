import type { ServerWorkspaceRecord } from '../../../../lib/server/server-workspace.api'
import { ServerChatView } from './ServerChatView'

export function ServerChannelMain({
  workspace,
  activeChannelId,
  onSearchClick,
}: {
  workspace: ServerWorkspaceRecord
  activeChannelId: string | null
  onSearchClick: () => void
}) {
  const activeChannel =
    workspace.channels.find((channel) => channel.id === activeChannelId) ?? workspace.channels[0] ?? null

  if (!activeChannel) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center bg-[#36393F] px-6 py-10">
        <div className="max-w-xl rounded-[28px] border border-white/[0.06] bg-white/[0.04] px-6 py-5 text-center text-slate-300">
          Server ini belum punya channel.
        </div>
      </section>
    )
  }

  return <ServerChatView workspace={workspace} activeChannel={activeChannel} onSearchClick={onSearchClick} />
}


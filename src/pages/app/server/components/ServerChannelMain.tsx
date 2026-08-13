import type { ServerWorkspaceRecord } from '../../../../lib/server/server-workspace.api'

function ChannelHeading({ title, topic }: { title: string; topic: string | null }) {
  return (
    <div className="min-w-0">
      <h1 className="truncate text-lg font-semibold text-white">{title}</h1>
      <p className="truncate text-sm text-slate-400">{topic ?? 'Channel terbuka untuk percakapan server.'}</p>
    </div>
  )
}

export function ServerChannelMain({
  workspace,
  activeChannelId,
}: {
  workspace: ServerWorkspaceRecord
  activeChannelId: string | null
}) {
  const activeChannel =
    workspace.channels.find((channel) => channel.id === activeChannelId) ?? workspace.channels[0] ?? null

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-[#36393F]">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="rounded-xl bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-200">
            #{workspace.server.name}
          </span>
          {activeChannel ? <ChannelHeading title={activeChannel.name} topic={activeChannel.topic} /> : null}
        </div>

        <div className="hidden rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-slate-300 xl:block">
          Workspace ready
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-10">
        {activeChannel ? (
          <div className="max-w-2xl text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#202225] text-3xl font-black text-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              #
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white">
              Welcome to {workspace.server.name}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
              Kamu sedang berada di channel <span className="font-semibold text-white">#{activeChannel.name}</span>.
              Sidebar kiri sudah menampilkan category dan channel tree sesuai data server.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] px-6 py-5 text-slate-300">
            Server ini belum punya channel.
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.06] px-5 py-4 lg:px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#202225] px-4 py-3 text-slate-400">
          <span className="text-lg leading-none text-slate-500">+</span>
          <span>Message #{activeChannel?.name ?? 'channel'}</span>
        </div>
      </div>
    </section>
  )
}


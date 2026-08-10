import { activeNowItems } from '../app.data'
import { InboxIcon, HelpIcon } from '../app-icons'

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
      {text}
    </span>
  )
}

function ActiveCard({
  title,
  detail,
  time,
  accent,
  badge,
}: {
  title: string
  detail: string
  time: string
  accent: string
  badge?: string
}) {
  return (
    <article className="rounded-3xl border border-white/[0.08] bg-white/5 p-4">
      <div className="flex items-start gap-3">
        <div className={`relative h-12 w-12 rounded-2xl bg-gradient-to-br ${accent}`}>
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#2B2D31] bg-[#202225] text-[10px] font-bold text-white">
            {badge ?? 'A'}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="mt-0.5 text-sm text-slate-400">{detail}</p>
          <p className="mt-1 text-xs text-[#8ca0ff]">{time}</p>
        </div>
      </div>
    </article>
  )
}

export function AppRightPanel() {
  return (
    <aside className="hidden w-[420px] shrink-0 border-l border-white/[0.06] bg-[#36393F] xl:flex xl:flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <h2 className="text-xl font-semibold text-white">Active Now</h2>
        <div className="flex items-center gap-2 text-slate-400">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
            <InboxIcon className="h-5 w-5" />
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
            <HelpIcon className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 px-5 py-4">
        <div className="rounded-[28px] border border-white/[0.08] bg-white/5 p-3">
          <div className="space-y-3">
            {activeNowItems.map((item) => (
              <ActiveCard
                key={item.title + item.detail}
                title={item.title}
                detail={item.detail}
                time={item.time}
                accent={item.accent}
                badge={item.badge}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/[0.08] bg-[#202225] p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Preview mode</p>
          <p className="mt-1 leading-6 text-slate-400">
            Layout ini sengaja dibuat statis dulu, mengikuti struktur dan warna pada UIUX
            Specification tanpa mengaktifkan logic aplikasi.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Badge text="desktop" />
            <Badge text="dark theme" />
            <Badge text="placeholder" />
          </div>
        </div>
      </div>
    </aside>
  )
}

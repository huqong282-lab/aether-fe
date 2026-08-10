import { AddIcon, CompassIcon, DownloadIcon, HomeIcon } from '../app-icons'
import logoImage from '../../../assets/aetherLg.png'
import { serverItems } from '../app.data'

function ServerBadge({ label, active, accent }: { label: string; active?: boolean; accent: string }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      {active ? <span className="absolute left-[-13px] h-8 w-1.5 rounded-full bg-white" /> : null}
      <div
        className={[
          'flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-lg transition-transform',
          accent,
          active ? 'scale-105' : 'hover:scale-105',
        ].join(' ')}
      >
        {label}
      </div>
    </div>
  )
}

export function AppServerRail() {
  return (
    <aside className="hidden w-[76px] shrink-0 border-r border-white/[0.06] bg-[#202225] px-3 py-4 md:flex md:flex-col">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#5865F2] shadow-[0_12px_30px_rgba(88,101,242,0.4)]">
          <img src={logoImage} alt="Aether" className="h-full w-full object-cover" />
        </div>
        <div className="h-px w-8 bg-white/10" />
        <div className="flex flex-col gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
            <HomeIcon className="h-6 w-6" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70">
            <AddIcon className="h-6 w-6" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70">
            <CompassIcon className="h-6 w-6" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70">
            <DownloadIcon className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto pb-2 pt-4">
        {serverItems.map((item) => (
          <ServerBadge
            key={item.label}
            label={item.label}
            accent={item.accent}
            active={item.active}
          />
        ))}
      </div>
    </aside>
  )
}

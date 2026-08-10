import { AddIcon, CompassIcon, DownloadIcon, HomeIcon } from '../app-icons'
import logoImage from '../../../assets/aetherLg.png'

export function AppServerRail({ onCreateServerClick }: { onCreateServerClick: () => void }) {
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
          <button
            type="button"
            onClick={onCreateServerClick}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Create server"
          >
            <AddIcon className="h-6 w-6" />
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70">
            <CompassIcon className="h-6 w-6" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70">
            <DownloadIcon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </aside>
  )
}

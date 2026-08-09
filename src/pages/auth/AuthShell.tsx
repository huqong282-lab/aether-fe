import type { ReactNode } from 'react'
import logoImage from '../../assets/aetherLg.png'
import bgImage from '../../assets/LoginRegistBg.png'
import { featureItems } from './auth-content'

type AuthShellProps = {
  title: string
  description: string
  children: ReactNode
}

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="min-h-screen bg-slate-950/55 backdrop-blur-[2px]">
        <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 py-6 sm:px-6 lg:grid-cols-[1.15fr_0.95fr] lg:px-10 xl:px-12">
          <section className="hidden flex-col justify-center text-white lg:flex">
            <div className="mb-8 flex items-center gap-4">
              <img
                src={logoImage}
                alt="Aether"
                className="h-16 w-16 rounded-3xl object-cover ring-1 ring-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
              />
              <span className="text-4xl font-extrabold tracking-tight">Aether</span>
            </div>

            <div className="max-w-xl">
              <h1 className="text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl xl:text-7xl">
                CONNECT.
                <br />
                COLLABORATE.
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-indigo-500 to-cyan-300 bg-clip-text text-transparent">
                  BELONG.
                </span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-200/85 sm:text-lg">
                Aether is the place to build communities, hang out, and stay connected.
              </p>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
              {featureItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </svg>
                  </div>
                  <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-950/65 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
                  Aether
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-300">{description}</p>
              </div>

              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

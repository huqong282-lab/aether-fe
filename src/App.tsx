import { useState } from 'react'
import logoImage from './assets/aetherLg.png'
import bgImage from './assets/LoginRegistBg.png'

type AuthMode = 'login' | 'register'

const featureItems = [
  {
    title: 'Chat',
    description: 'Talk in real time with your friends',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    ),
  },
  {
    title: 'Community',
    description: 'Create or join amazing servers',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
  },
  {
    title: 'Secure',
    description: 'Your privacy is our priority',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
] as const

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.95h5.62c-.24 1.18-.94 2.18-2 2.86v2.38h3.24c1.89-1.74 2.98-4.31 2.98-7.35 0-.71-.06-1.38-.17-2h-9.67z"
      />
      <path
        fill="#34A853"
        d="M6.79 14.18l-.68.52-2.4 1.87a9.997 9.997 0 0018.15-5.07h-6.06a5.75 5.75 0 01-8.06 2.68z"
      />
      <path
        fill="#FBBC05"
        d="M4.9 8.18a10 10 0 000 7.2l3.08-2.39a5.95 5.95 0 010-2.42z"
      />
      <path
        fill="#4285F4"
        d="M12 4.75a5.5 5.5 0 013.9 1.53l2.9-2.9A9.74 9.74 0 0012 2a9.997 9.997 0 00-7.1 3.18l3.08 2.39A5.97 5.97 0 0112 4.75z"
      />
    </svg>
  )
}

function App() {
  const [mode, setMode] = useState<AuthMode>('login')

  const isLogin = mode === 'login'
  const headline = isLogin ? 'Welcome Back!' : 'Create Your Account'

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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
                    Aether
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                    {headline}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {isLogin
                      ? "We're excited to see you again."
                      : 'Join the community in a few quick steps.'}
                  </p>
                </div>
              </div>

              <form className="mt-6 space-y-4">
                {!isLogin && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    {isLogin ? 'Email or Username' : 'Username'}
                  </label>
                  <input
                    placeholder={isLogin ? 'Enter your email or username' : 'Choose a username'}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Repeat your password"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="text-right">
                    <a href="/" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">
                      Forgot your password?
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.35)] transition hover:brightness-110"
                >
                  {isLogin ? 'Login' : 'Create Account'}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4 text-slate-500">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-sm">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="mt-6 text-center text-sm text-slate-300">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setMode(isLogin ? 'register' : 'login')}
                  className="font-semibold text-indigo-300 hover:text-indigo-200"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default App

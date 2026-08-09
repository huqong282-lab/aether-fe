import { AuthShell } from './AuthShell'
import { GoogleIcon } from './auth-content'
import { useNavigate } from 'react-router-dom'

export function RegisterPage() {
  const navigate = useNavigate()

  return (
    <AuthShell
      title="Create Your Account"
      description="Join the community in a few quick steps."
    >
      <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Username</label>
          <input
            placeholder="Choose a username"
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

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

        <button
          type="submit"
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.35)] transition hover:brightness-110"
        >
          Create Account
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
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-semibold text-indigo-300 hover:text-indigo-200"
        >
          Sign In
        </button>
      </p>
    </AuthShell>
  )
}

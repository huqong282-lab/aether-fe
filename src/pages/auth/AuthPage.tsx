import { AuthField } from '../../components/auth/AuthField'
import { AuthPasswordStrength } from '../../components/auth/AuthPasswordStrength'
import { AuthShell } from '../../components/auth/AuthShell'
import { GoogleIcon } from '../../components/auth/auth-content'
import { useAuthPage } from '../../lib/auth/useAuthPage'
import type { AuthMode } from '../../lib/auth/types'

type AuthPageProps = {
  mode: AuthMode
}

export function AuthPage({ mode }: AuthPageProps) {
  const {
    locationState,
    loginValues,
    setLoginValues,
    registerValues,
    setRegisterValues,
    setLoginTouched,
    setRegisterTouched,
    loginServerMessage,
    registerServerMessage,
    loginMutation,
    registerMutation,
    loginFieldError,
    registerFieldError,
    submitLogin,
    submitRegister,
    navigate,
  } = useAuthPage(mode)

  return (
    <AuthShell
      title={mode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
      description={
        mode === 'login'
          ? "We're excited to see you again."
          : 'Join the community in a few quick steps.'
      }
    >
      {mode === 'login' ? (
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            submitLogin()
          }}
        >
          {locationState?.notice ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {locationState.notice}
            </div>
          ) : null}

          {loginServerMessage ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {loginServerMessage}
            </div>
          ) : null}

          <AuthField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={loginValues.email}
            onChange={(event) => setLoginValues((current) => ({ ...current, email: event.target.value }))}
            onBlur={() => setLoginTouched((current) => ({ ...current, email: true }))}
            error={loginFieldError('email')}
          />

          <AuthField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={loginValues.password}
            onChange={(event) => setLoginValues((current) => ({ ...current, password: event.target.value }))}
            onBlur={() => setLoginTouched((current) => ({ ...current, password: true }))}
            error={loginFieldError('password')}
          />

          <div className="text-right">
            <a href="/" className="text-sm font-medium text-indigo-300 hover:text-indigo-200">
              Forgot your password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>

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
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register', { replace: true })}
              className="font-semibold text-indigo-300 hover:text-indigo-200"
            >
              Sign Up
            </button>
          </p>
        </form>
      ) : (
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            submitRegister()
          }}
        >
          {registerServerMessage ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {registerServerMessage}
            </div>
          ) : null}

          <AuthField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={registerValues.email}
            onChange={(event) => setRegisterValues((current) => ({ ...current, email: event.target.value }))}
            onBlur={() => setRegisterTouched((current) => ({ ...current, email: true }))}
            error={registerFieldError('email')}
          />

          <AuthField
            label="Username"
            type="text"
            autoComplete="username"
            placeholder="Choose a username"
            value={registerValues.username}
            onChange={(event) => setRegisterValues((current) => ({ ...current, username: event.target.value }))}
            onBlur={() => setRegisterTouched((current) => ({ ...current, username: true }))}
            error={registerFieldError('username')}
            helper="Username ini dipakai untuk identitas akun."
          />

          <AuthField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password"
            value={registerValues.password}
            onChange={(event) => setRegisterValues((current) => ({ ...current, password: event.target.value }))}
            onBlur={() => setRegisterTouched((current) => ({ ...current, password: true }))}
            error={registerFieldError('password')}
            helper="Minimal 8 karakter."
          />

          <AuthPasswordStrength password={registerValues.password} />

          <AuthField
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={registerValues.confirmPassword}
            onChange={(event) =>
              setRegisterValues((current) => ({ ...current, confirmPassword: event.target.value }))
            }
            onBlur={() =>
              setRegisterTouched((current) => ({ ...current, confirmPassword: true }))
            }
            error={registerFieldError('confirmPassword')}
          />

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
          </button>

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
              onClick={() => navigate('/login', { replace: true })}
              className="font-semibold text-indigo-300 hover:text-indigo-200"
            >
              Sign In
            </button>
          </p>
        </form>
      )}
    </AuthShell>
  )
}

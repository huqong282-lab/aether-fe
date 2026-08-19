import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { AuthField } from '../../components/auth/AuthField'
import { AuthShell } from '../../components/auth/AuthShell'
import { normalizeApiError } from '../../lib/api-error'
import {
  resendVerificationRequest,
  verifyEmailRequest,
} from '../../lib/auth/auth.api'
import { verifyEmailFormSchema, type VerifyEmailFormValues } from '../../lib/auth/auth.schemas'
import type { AuthLocationState } from '../../lib/auth/types'

type VerifyLocationState = AuthLocationState

const initialValues: VerifyEmailFormValues = {
  email: '',
  code: '',
}

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as VerifyLocationState

  const [values, setValues] = useState<VerifyEmailFormValues>(() => ({
    ...initialValues,
    email: locationState?.email ?? '',
  }))
  const [touched, setTouched] = useState<Record<keyof VerifyEmailFormValues, boolean>>({
    email: false,
    code: false,
  })
  const [attempted, setAttempted] = useState(false)
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [serverErrors, setServerErrors] = useState<Partial<Record<keyof VerifyEmailFormValues, string>>>({})

  useEffect(() => {
    if (locationState?.email) {
      setValues((current) => ({ ...current, email: locationState.email ?? current.email }))
    }
  }, [locationState?.email])

  const parseResult = useMemo(() => verifyEmailFormSchema.safeParse(values), [values])
  const clientErrors = useMemo(
    () => (parseResult.success ? {} : parseResult.error.issues.reduce<Record<string, string>>((acc, issue) => {
      const field = issue.path[0]
      if (typeof field === 'string' && !acc[field]) {
        acc[field] = issue.message
      }
      return acc
    }, {})),
    [parseResult],
  )

  const verifyMutation = useMutation({
    mutationFn: verifyEmailRequest,
    onSuccess: () => {
      navigate('/login', {
        replace: true,
        state: {
          email: values.email,
          notice: 'Email berhasil diverifikasi. Silakan login.',
        },
      })
    },
    onError: (error) => {
      const normalized = normalizeApiError(error, 'Gagal memverifikasi email. Coba lagi nanti.')
      setServerMessage(normalized.message)
      setServerErrors(normalized.fieldErrors as Partial<Record<keyof VerifyEmailFormValues, string>>)
    },
  })

  const resendMutation = useMutation({
    mutationFn: resendVerificationRequest,
    onSuccess: (response) => {
      const email = response.data.email
      setServerMessage(`Kode verifikasi baru sudah dikirim ke ${email}.`)
    },
    onError: (error) => {
      const normalized = normalizeApiError(error, 'Gagal mengirim ulang kode verifikasi. Coba lagi nanti.')
      setServerMessage(normalized.message)
      setServerErrors(normalized.fieldErrors as Partial<Record<keyof VerifyEmailFormValues, string>>)
    },
  })

  const fieldError = (field: keyof VerifyEmailFormValues) => {
    const shouldShow = touched[field] || attempted || Boolean(values[field])
    if (!shouldShow) {
      return undefined
    }

    return serverErrors[field] ?? clientErrors[field]
  }

  const submit = () => {
    setAttempted(true)
    setServerMessage(null)
    setServerErrors({})

    const parsed = verifyEmailFormSchema.safeParse(values)
    if (!parsed.success) {
      return
    }

    verifyMutation.mutate(parsed.data)
  }

  return (
    <AuthShell
      title="Verify Your Email"
      description="Masukkan kode 6 digit yang dikirim ke email kamu untuk menyelesaikan login flow."
    >
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        {locationState?.notice ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {locationState.notice}
          </div>
        ) : null}

        {serverMessage ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {serverMessage}
          </div>
        ) : null}

        <AuthField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={values.email}
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          error={fieldError('email')}
        />

        <AuthField
          label="Verification Code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="6 digit code"
          value={values.code}
          onChange={(event) =>
            setValues((current) => ({ ...current, code: event.target.value.replace(/\D/g, '').slice(0, 6) }))
          }
          onBlur={() => setTouched((current) => ({ ...current, code: true }))}
          error={fieldError('code')}
          helper="Kode verifikasi dikirim ke email yang kamu daftarkan."
        />

        <button
          type="submit"
          disabled={verifyMutation.isPending}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {verifyMutation.isPending ? 'Verifying...' : 'Verify Email'}
        </button>

        <button
          type="button"
          disabled={resendMutation.isPending || !values.email.trim()}
          onClick={() => {
            setServerMessage(null)
            resendMutation.mutate(values.email)
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resendMutation.isPending ? 'Sending code...' : 'Resend verification code'}
        </button>

        <p className="mt-6 text-center text-sm text-slate-300">
          Back to{' '}
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true, state: { email: values.email } })}
            className="font-semibold text-indigo-300 hover:text-indigo-200"
          >
            Login
          </button>
        </p>
      </form>
    </AuthShell>
  )
}

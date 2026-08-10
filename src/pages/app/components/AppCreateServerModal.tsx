import { useEffect, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AuthField } from '../../../components/auth/AuthField'
import { normalizeApiError } from '../../../lib/api-error'
import { createServerRequest } from '../../../lib/server/server.api'

type CreateServerTemplate = {
  label: string
  icon: string
  accent: string
}

const templateOptions: CreateServerTemplate[] = [
  { label: 'Create My Own', icon: 'CM', accent: 'from-emerald-400 to-lime-300' },
  { label: 'Gaming', icon: 'GM', accent: 'from-indigo-400 to-violet-300' },
  { label: 'Friends', icon: 'FR', accent: 'from-pink-400 to-rose-300' },
  { label: 'Study Group', icon: 'SG', accent: 'from-fuchsia-400 to-pink-300' },
  { label: 'School Club', icon: 'SC', accent: 'from-sky-400 to-cyan-300' },
]

const defaultServerForm = {
  name: 'Aether Community',
  iconUrl: 'https://example.com/aether-icon.png',
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AppCreateServerModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [step, setStep] = useState<'chooser' | 'form'>('chooser')
  const [formValues, setFormValues] = useState(defaultServerForm)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setStep('chooser')
    setFormValues(defaultServerForm)
    setFieldErrors({})
    setFormMessage(null)
  }, [open])

  const createServerMutation = useMutation({
    mutationFn: createServerRequest,
    onSuccess: () => {
      onClose()
      navigate('/app', { replace: true })
    },
    onError: (error) => {
      const normalized = normalizeApiError(error, 'Gagal membuat server')
      setFieldErrors(normalized.fieldErrors)
      setFormMessage(normalized.message)
    },
  })

  const openCreateForm = () => {
    setStep('form')
    setFieldErrors({})
    setFormMessage(null)
  }

  const submitCreateServer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setFormMessage(null)

    const trimmedName = formValues.name.trim()
    const trimmedIconUrl = formValues.iconUrl.trim()
    const nextFieldErrors: Record<string, string> = {}

    if (!trimmedName) {
      nextFieldErrors.name = 'Nama server wajib diisi'
    }

    if (trimmedIconUrl && !/^https?:\/\//i.test(trimmedIconUrl)) {
      nextFieldErrors.iconUrl = 'Icon URL harus berupa URL yang valid'
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      return
    }

    createServerMutation.mutate({
      name: trimmedName,
      iconUrl: trimmedIconUrl || undefined,
    })
  }

  if (!open) {
    return null
  }

  const isFormStep = step === 'form'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative flex max-h-[min(84vh,760px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#2b2d31] text-white shadow-[0_30px_90px_rgba(0,0,0,0.58)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-server-title"
      >
        <div className="relative flex min-h-[640px] flex-col">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Close create server dialog"
          >
            <span className="text-2xl leading-none">x</span>
          </button>

          {!isFormStep ? (
            <>
              <div className="px-6 pb-4 pt-6 text-center sm:px-8 sm:pt-8">
                <h2 id="create-server-title" className="text-3xl font-extrabold tracking-tight">
                  Create Your Server
                </h2>
                <p className="mx-auto mt-3 max-w-[36ch] text-base leading-7 text-slate-300">
                  Your server is where you and your friends hang out. Make yours and start talking.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-8">
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={openCreateForm}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-300 text-sm font-bold text-slate-950 shadow-[0_10px_30px_rgba(74,222,128,0.22)]">
                        CM
                      </span>
                      <span className="text-lg font-medium">Create My Own</span>
                    </div>
                    <span className="text-slate-500">
                      <ChevronRightIcon />
                    </span>
                  </button>

                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Start From A Template
                    </p>

                    <div className="space-y-3">
                      {templateOptions.slice(1).map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          className="flex w-full items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.07]"
                        >
                          <div className="flex items-center gap-4">
                            <span
                              className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-sm font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]`}
                            >
                              {item.icon}
                            </span>
                            <span className="text-lg font-medium">{item.label}</span>
                          </div>
                          <span className="text-slate-500">
                            <ChevronRightIcon />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 text-center">
                    <p className="text-lg font-bold text-white">Have an invite already?</p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-xl bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
                    >
                      Join a Server
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form className="flex flex-1 flex-col" onSubmit={submitCreateServer}>
              <div className="px-6 pb-4 pt-6 sm:px-8 sm:pt-8">
                <button
                  type="button"
                  onClick={() => setStep('chooser')}
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                >
                  <span className="text-base leading-none">&larr;</span>
                  Back
                </button>

                <h2 id="create-server-title" className="text-3xl font-extrabold tracking-tight">
                  Create Your Server
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-300">
                  Isi data awal server di bawah ini. Field sudah diprefill sesuai contoh dari BE.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-8">
                <div className="space-y-5">
                  <AuthField
                    label="Server Name"
                    value={formValues.name}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Enter server name"
                    autoComplete="off"
                    error={fieldErrors.name}
                    helper="Minimal 1 karakter, maksimal 100 karakter."
                  />

                  <AuthField
                    label="Icon URL"
                    value={formValues.iconUrl}
                    onChange={(event) =>
                      setFormValues((current) => ({ ...current, iconUrl: event.target.value }))
                    }
                    placeholder="https://example.com/aether-icon.png"
                    autoComplete="off"
                    error={fieldErrors.iconUrl}
                    helper="Opsional, tapi kalau diisi harus URL valid."
                  />

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Preview</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#5865F2] to-[#8b9eff] text-lg font-bold text-white">
                        {formValues.name.trim().slice(0, 1) || 'A'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-white">
                          {formValues.name || 'Aether Community'}
                        </p>
                        <p className="truncate text-sm text-slate-400">
                          {formValues.iconUrl || 'https://example.com/aether-icon.png'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {formMessage ? (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {formMessage}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={createServerMutation.isPending}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3.5 text-base font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {createServerMutation.isPending ? 'Creating server...' : 'Create Server'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

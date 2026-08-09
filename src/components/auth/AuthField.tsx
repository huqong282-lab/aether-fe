import type { InputHTMLAttributes } from 'react'

const inputClassName =
  'w-full rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30'

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  helper?: string
}

export function AuthField({ label, error, helper, ...props }: AuthFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">{label}</label>
      <input
        {...props}
        className={`${inputClassName} ${error ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-500/30' : ''}`}
      />
      {helper ? <p className="mt-2 text-xs text-slate-400">{helper}</p> : null}
      {error ? <p className="mt-2 text-xs font-medium text-rose-300">{error}</p> : null}
    </div>
  )
}


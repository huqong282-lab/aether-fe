function getPasswordStrength(password: string) {
  if (!password) {
    return { label: 'Belum diisi', barClass: 'bg-slate-600', textClass: 'text-slate-400' }
  }

  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  if (checks <= 2) {
    return { label: 'Lemah', barClass: 'bg-rose-500', textClass: 'text-rose-300' }
  }

  if (checks === 3) {
    return { label: 'Cukup', barClass: 'bg-amber-400', textClass: 'text-amber-200' }
  }

  if (checks === 4) {
    return { label: 'Kuat', barClass: 'bg-cyan-400', textClass: 'text-cyan-200' }
  }

  return { label: 'Sangat kuat', barClass: 'bg-emerald-400', textClass: 'text-emerald-200' }
}

export function AuthPasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  return (
    <div className="mt-2">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">Kekuatan password</span>
        <span className={strength.textClass}>{strength.label}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div
          className={`h-1.5 rounded-full transition-all ${strength.barClass}`}
          style={{ width: `${(Math.min(checks, 5) / 5) * 100}%` }}
        />
      </div>
    </div>
  )
}


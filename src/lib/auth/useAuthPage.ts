import { useEffect, useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { normalizeApiError } from '../api-error'
import { useAuthStore } from '../../state/auth.state'
import { loginRequest, registerRequest } from './auth.api'
import {
  loginFormSchema,
  registerFormSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from './auth.schemas'
import type { AuthLocationState, AuthMode } from './types'

export type LoginField = keyof LoginFormValues
export type RegisterField = keyof RegisterFormValues

function issuesToFieldErrors(issues: z.ZodIssue[]) {
  return issues.reduce<Record<string, string>>((accumulator, issue) => {
    const field = issue.path[0]
    if (typeof field === 'string' && !accumulator[field]) {
      accumulator[field] = issue.message
    }
    return accumulator
  }, {})
}

export function useAuthPage(mode: AuthMode) {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)
  const locationState = location.state as AuthLocationState

  const [loginValues, setLoginValues] = useState<LoginFormValues>({
    email: locationState?.email ?? '',
    password: '',
  })
  const [registerValues, setRegisterValues] = useState<RegisterFormValues>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })

  const [loginTouched, setLoginTouched] = useState<Record<LoginField, boolean>>({
    email: false,
    password: false,
  })
  const [registerTouched, setRegisterTouched] = useState<Record<RegisterField, boolean>>({
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
  })

  const [loginAttempted, setLoginAttempted] = useState(false)
  const [registerAttempted, setRegisterAttempted] = useState(false)
  const [loginServerMessage, setLoginServerMessage] = useState<string | null>(null)
  const [registerServerMessage, setRegisterServerMessage] = useState<string | null>(null)
  const [loginServerErrors, setLoginServerErrors] = useState<Partial<Record<LoginField, string>>>(
    {},
  )
  const [registerServerErrors, setRegisterServerErrors] = useState<
    Partial<Record<RegisterField, string>>
  >({})

  useEffect(() => {
    if (mode === 'login' && locationState?.email) {
      setLoginValues((current) => ({ ...current, email: locationState.email ?? current.email }))
    }
  }, [locationState?.email, mode])

  useEffect(() => {
    setLoginServerMessage(null)
    setRegisterServerMessage(null)
  }, [mode])

  const loginParse = useMemo(() => loginFormSchema.safeParse(loginValues), [loginValues])
  const loginClientErrors = useMemo(
    () => (loginParse.success ? {} : issuesToFieldErrors(loginParse.error.issues)),
    [loginParse],
  )

  const registerParse = useMemo(() => registerFormSchema.safeParse(registerValues), [registerValues])
  const registerClientErrors = useMemo(
    () => (registerParse.success ? {} : issuesToFieldErrors(registerParse.error.issues)),
    [registerParse],
  )

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (response) => {
      const authData = response.data

      setAuth({
        user: authData.user,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
      })

      navigate('/app', { replace: true })
    },
    onError: (error) => {
      const normalized = normalizeApiError(
        error,
        'Gagal login. Coba lagi nanti.',
        'Email atau password salah.',
      )
      setLoginServerMessage(normalized.message)
      setLoginServerErrors(normalized.fieldErrors)
    },
  })

  const registerMutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      navigate('/login', {
        replace: true,
        state: {
          email: registerValues.email,
          notice: 'Registrasi berhasil. Silakan login.',
        },
      })
    },
    onError: (error) => {
      const normalized = normalizeApiError(
        error,
        'Gagal register. Coba lagi nanti.',
        'Email atau username sudah terdaftar.',
      )
      setRegisterServerMessage(normalized.message)
      setRegisterServerErrors(normalized.fieldErrors)
    },
  })

  const loginFieldError = (field: LoginField) => {
    const shouldShow = loginTouched[field] || loginAttempted || Boolean(loginValues[field])
    if (!shouldShow) return undefined
    return loginServerErrors[field] ?? loginClientErrors[field]
  }

  const registerFieldError = (field: RegisterField) => {
    const shouldShow = registerTouched[field] || registerAttempted || Boolean(registerValues[field])
    if (!shouldShow) return undefined
    return registerServerErrors[field] ?? registerClientErrors[field]
  }

  const submitLogin = () => {
    setLoginAttempted(true)
    setLoginServerMessage(null)
    setLoginServerErrors({})

    const parsed = loginFormSchema.safeParse(loginValues)
    if (!parsed.success) return false

    loginMutation.mutate(parsed.data)
    return true
  }

  const submitRegister = () => {
    setRegisterAttempted(true)
    setRegisterServerMessage(null)
    setRegisterServerErrors({})

    const parsed = registerFormSchema.safeParse(registerValues)
    if (!parsed.success) return false

    registerMutation.mutate({
      email: parsed.data.email,
      username: parsed.data.username,
      password: parsed.data.password,
    })
    return true
  }

  return {
    locationState,
    loginValues,
    setLoginValues,
    registerValues,
    setRegisterValues,
    loginTouched,
    setLoginTouched,
    registerTouched,
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
  }
}


import { apiClient } from '../api'
import type { LoginFormValues, RegisterFormValues, VerifyEmailFormValues } from './auth.schemas'

export type AuthUser = {
  id: string
  email: string
  username: string
}

export type LoginApiResponse = {
  data: {
    user: AuthUser
    accessToken: string
    refreshToken: string
  }
}

export type RegisterApiResponse = {
  data: {
    id: string
    email: string
    username: string
    createdAt: string
  }
}

export type VerifyEmailApiResponse = {
  data: {
    emailVerified: boolean
  }
}

export type ResendVerificationApiResponse = {
  data: {
    email: string
  }
}

export async function loginRequest(payload: LoginFormValues) {
  const response = await apiClient.post('/auth/login', payload)
  return response.data as LoginApiResponse
}

export async function registerRequest(payload: Omit<RegisterFormValues, 'confirmPassword'>) {
  const response = await apiClient.post('/auth/register', payload)
  return response.data as RegisterApiResponse
}

export async function verifyEmailRequest(payload: VerifyEmailFormValues) {
  const response = await apiClient.post('/auth/verify-email', payload)
  return response.data as VerifyEmailApiResponse
}

export async function resendVerificationRequest(email: string) {
  const response = await apiClient.post('/auth/resend-verification', { email })
  return response.data as ResendVerificationApiResponse
}


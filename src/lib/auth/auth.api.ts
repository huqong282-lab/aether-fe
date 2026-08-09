import { apiClient } from '../api'
import type { LoginFormValues, RegisterFormValues } from './auth.schemas'

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

export async function loginRequest(payload: LoginFormValues) {
  const response = await apiClient.post('/auth/login', payload)
  return response.data as LoginApiResponse
}

export async function registerRequest(payload: Omit<RegisterFormValues, 'confirmPassword'>) {
  const response = await apiClient.post('/auth/register', payload)
  return response.data as RegisterApiResponse
}


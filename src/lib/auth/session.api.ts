import { apiClient } from '../api'

export type DeviceSession = {
  id: string
  deviceInfo: string | null
  ipAddress: string | null
  expiresAt: string
  createdAt: string
  updatedAt: string
}

type DeviceSessionsResponse = {
  data?: DeviceSession[] | null
  success?: boolean
  message?: string
}

export async function fetchDeviceSessions() {
  const response = await apiClient.get('/device/sessions')
  const payload = response.data as DeviceSession[] | DeviceSessionsResponse

  if (Array.isArray(payload)) {
    return payload
  }

  return payload.data ?? []
}

export async function revokeDeviceSession(sessionId: string) {
  await apiClient.delete(`/device/sessions/${sessionId}`)
}

import axios from 'axios'
import { apiClient } from '../api'

export type VoiceTokenRequestPayload = {
  withVideo: boolean
}

export type VoiceTokenResponseData = {
  livekitUrl?: string
  serverUrl?: string
  token: string
  roomName: string
}

export type VoiceTokenResponse = {
  data: VoiceTokenResponseData
}

export async function requestVoiceToken(channelId: string, payload: VoiceTokenRequestPayload) {
  const response = await apiClient.post(`/channels/${channelId}/voice/token`, payload)
  return response.data as VoiceTokenResponse
}

export function normalizeVoiceTokenError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : 'Gagal bergabung ke voice channel.'
  }

  const status = error.response?.status
  const responseData = error.response?.data as { message?: string } | undefined

  if (status === 403) {
    return 'Kamu tidak memiliki izin untuk bergabung ke voice channel.'
  }

  if (status === 401) {
    return 'Sesi kamu perlu login ulang untuk bergabung ke voice channel.'
  }

  if (status === 503) {
    return 'LiveKit server sedang tidak dapat dihubungi. Coba lagi nanti.'
  }

  return responseData?.message ?? error.message ?? 'Gagal bergabung ke voice channel.'
}

export function resolveLiveKitUrl(response: VoiceTokenResponseData) {
  return response.livekitUrl ?? response.serverUrl ?? null
}

import { apiClient } from '../api'

export type CreateServerPayload = {
  name: string
  iconUrl?: string
}

export type ServerRecord = {
  id: string
  ownerId: string
  name: string
  iconUrl: string | null
  createdAt: string
  updatedAt: string
}

type CreateServerResponse = {
  data: ServerRecord
}

export async function createServerRequest(payload: CreateServerPayload) {
  const response = await apiClient.post('/servers', payload)
  return response.data as CreateServerResponse
}

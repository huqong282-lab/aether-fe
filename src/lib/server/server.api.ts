import { apiClient } from '../api'

export type CreateServerPayload = {
  name: string
  iconUrl?: string
}

export type JoinServerPayload = {
  serverId: string
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

type ListServerResponse = {
  data: ServerRecord[]
}

type JoinServerResponse = {
  data: {
    id: string
    serverId: string
    userId: string
    roleId: string
    createdAt: string
    updatedAt: string
  }
}

export async function createServerRequest(payload: CreateServerPayload) {
  const response = await apiClient.post('/servers', payload)
  return response.data as CreateServerResponse
}

export const ownedServersQueryKey = ['servers', 'owned'] as const

export async function getOwnedServersRequest() {
  const response = await apiClient.get('/servers')
  return response.data as ListServerResponse
}

export async function getServerByIdRequest(serverId: string) {
  const response = await apiClient.get(`/servers/${serverId}`)
  return response.data as { data: ServerRecord }
}

export async function joinServerRequest({ serverId }: JoinServerPayload) {
  const response = await apiClient.post(`/membership/${serverId}/join`)
  return response.data as JoinServerResponse
}

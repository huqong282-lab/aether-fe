import { apiClient } from '../api'

export type ServerCategoryRecord = {
  id: string
  serverId: string
  name: string
  position: number
  createdAt: string
  updatedAt: string
}

export type ServerChannelType = 'TEXT' | 'VOICE' | 'VIDEO' | 'FORUM' | 'ANNOUNCEMENT'

export type ServerChannelRecord = {
  id: string
  serverId: string
  categoryId: string | null
  name: string
  type: ServerChannelType
  topic: string | null
  position: number
}

export type ServerWorkspaceRecord = {
  server: {
    id: string
    ownerId: string
    name: string
    iconUrl: string | null
    createdAt: string
    updatedAt: string
  }
  categories: ServerCategoryRecord[]
  channels: ServerChannelRecord[]
}

type ServerCategoryListResponse = {
  data: ServerCategoryRecord[]
}

type ServerChannelListResponse = {
  data: ServerChannelRecord[]
}

type CreateCategoryPayload = {
  name: string
}

type CreateCategoryResponse = {
  data: ServerCategoryRecord
}

type CreateChannelPayload = {
  name: string
  type: ServerChannelType
  topic?: string
  categoryId?: string | null
}

type CreateChannelResponse = {
  data: ServerChannelRecord
}

export const serverWorkspaceQueryKeys = {
  server: (serverId: string) => ['servers', serverId, 'workspace'] as const,
  categories: (serverId: string) => ['servers', serverId, 'categories'] as const,
  channels: (serverId: string) => ['servers', serverId, 'channels'] as const,
}

export async function getServerCategoriesRequest(serverId: string) {
  const response = await apiClient.get(`/category/${serverId}/categories`)
  return response.data as ServerCategoryListResponse
}

export async function getServerChannelsRequest(serverId: string) {
  const response = await apiClient.get(`/channel/${serverId}/channel`)
  return response.data as ServerChannelListResponse
}

export async function createServerCategoryRequest(
  serverId: string,
  payload: CreateCategoryPayload,
) {
  const response = await apiClient.post(`/category/${serverId}/category`, payload)
  return response.data as CreateCategoryResponse
}

export async function createServerChannelRequest(
  serverId: string,
  payload: CreateChannelPayload,
) {
  const response = await apiClient.post(`/channel/${serverId}/channel`, payload)
  return response.data as CreateChannelResponse
}

export async function createDefaultServerWorkspaceRequest(serverId: string) {
  const categoryResponse = await createServerCategoryRequest(serverId, {
    name: 'general',
  })

  const channelResponse = await createServerChannelRequest(serverId, {
    name: 'general',
    type: 'TEXT',
    categoryId: categoryResponse.data.id,
  })

  return {
    category: categoryResponse.data,
    channel: channelResponse.data,
  }
}

import { apiClient } from '../api'

export type SearchEntityType = 'all' | 'message' | 'file' | 'channel' | 'user'

export type SearchMessageResult = {
  id: string
  channelId: string
  serverId: string
  snippet?: string
  content?: string
  channelName?: string
  serverName?: string
  authorName?: string
  createdAt?: string
}

export type SearchFileResult = {
  id: string
  channelId?: string
  serverId?: string
  fileName?: string
  fileUrl?: string
  snippet?: string
  channelName?: string
  serverName?: string
  createdAt?: string
}

export type SearchChannelResult = {
  id: string
  serverId: string
  name?: string
  topic?: string
  type?: string
  serverName?: string
}

export type SearchUserResult = {
  id: string
  username?: string
  displayName?: string
  email?: string
  avatarUrl?: string | null
  serverName?: string
}

export type SearchResponse = {
  data?: {
    messages?: SearchMessageResult[]
    files?: SearchFileResult[]
    channels?: SearchChannelResult[]
    users?: SearchUserResult[]
  }
  pagination?: {
    hasMore?: boolean
  }
}

export async function searchRequest(params: {
  q: string
  serverId: string
  type?: Exclude<SearchEntityType, 'all'>
  channelId?: string
  limit?: number
}) {
  const response = await apiClient.get('/search', {
    params,
  })

  return response.data as SearchResponse
}

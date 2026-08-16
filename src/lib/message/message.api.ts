import { apiClient } from '../api'

export type MessageAttachmentRecord = {
  id: string
  messageId: string | null
  fileUrl: string
  thumbnailUrl: string | null
  fileType: string
  fileSize: string | number
  fileName: string
}

export type MessageAuthorRecord = {
  id: string
  email: string
  username: string
}

export type MessageRecord = {
  id: string
  channelId: string
  authorId: string
  replyToId: string | null
  threadRootId: string | null
  content: string
  isPinned: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  author?: MessageAuthorRecord
  attachments?: MessageAttachmentRecord[]
}

export type ChannelMessageListResponse = {
  data: MessageRecord[]
  meta?: {
    nextCursor?: string | null
    hasMore?: boolean
    limit?: number
    total?: number
  }
}

export type CreateChannelMessagePayload = {
  content: string
  replyToId?: string | null
  threadRootId?: string | null
  attachments?: Array<{
    fileUrl: string
    thumbnailUrl?: string | null
    fileType: string
    fileSize: number
    fileName: string
  }>
}

export type UpdateMessagePayload = {
  content: string
}

export type MessageSearchItem = {
  id: string
  channelId: string
  serverId: string
  content: string
  createdAt: string
}

export type MessageSearchResponse = {
  data: MessageSearchItem[]
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export type MessageThreadResponse = {
  data: {
    rootMessage: MessageRecord
    messages: MessageRecord[]
  }
}

export async function getChannelMessagesRequest(
  channelId: string,
  params?: {
    limit?: number
    cursor?: string
  },
) {
  const response = await apiClient.get(`/message/${channelId}/messages`, {
    params,
  })

  return response.data as ChannelMessageListResponse
}

export async function createChannelMessageRequest(channelId: string, payload: CreateChannelMessagePayload) {
  const response = await apiClient.post(`/message/${channelId}`, payload)
  return response.data as { data: MessageRecord }
}

export async function updateMessageRequest(messageId: string, payload: UpdateMessagePayload) {
  const response = await apiClient.patch(`/message/${messageId}`, payload)
  return response.data as { data: MessageRecord }
}

export async function deleteMessageRequest(messageId: string) {
  const response = await apiClient.delete(`/message/${messageId}`)
  return response.data as { success: boolean; message: string }
}

export async function pinMessageRequest(messageId: string) {
  const response = await apiClient.post(`/message/${messageId}/pin`)
  return response.data as { data: MessageRecord }
}

export async function unpinMessageRequest(messageId: string) {
  const response = await apiClient.delete(`/message/${messageId}/pin`)
  return response.data as { data: MessageRecord }
}

export async function getMessageThreadRequest(messageId: string) {
  const response = await apiClient.get(`/message/${messageId}/thread`)
  return response.data as MessageThreadResponse
}

export async function searchMessagesRequest(params: {
  serverId: string
  q: string
  channelId?: string
  limit?: number
  offset?: number
}) {
  const response = await apiClient.get('/message/search', {
    params,
  })

  return response.data as MessageSearchResponse
}


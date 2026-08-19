import { apiClient } from '../api'

export type ChannelReadStateRecord = {
  id: string
  userId: string
  channelId: string
  lastReadMessageId: string | null
  readAt: string
  message?: {
    id: string
  } | null
}

type ReadReceiptResponse = {
  data: ChannelReadStateRecord | null
}

export async function getChannelReadReceiptRequest(channelId: string) {
  const response = await apiClient.get(`/read-receipt/${channelId}`)
  return response.data as ReadReceiptResponse
}

export async function updateChannelReadReceiptRequest(channelId: string, messageId: string) {
  const response = await apiClient.patch(`/read-receipt/${channelId}`, {
    messageId,
  })

  return response.data as ReadReceiptResponse
}

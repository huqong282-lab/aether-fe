import { apiClient } from '../api'

export type ServerMemberMentionRecord = {
  id: string
  serverId: string
  userId: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  presence?: 'online' | 'idle' | 'dnd' | 'offline'
}

export async function getServerMembersRequest(serverId: string) {
  const response = await apiClient.get(`/membership/${serverId}/members`)
  return response.data as { data: ServerMemberMentionRecord[] }
}


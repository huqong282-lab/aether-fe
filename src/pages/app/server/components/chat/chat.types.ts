export type PresenceState = 'online' | 'idle' | 'dnd' | 'offline'

export type ChatStatus = 'sending' | 'sent' | 'failed'

export type ChatMember = {
  id: string
  name: string
  handle: string
  presence: PresenceState
  accent: string
}

export type ChatAttachment = {
  id: string
  name: string
  sizeLabel: string
}

export type ChatMessage = {
  id: string
  authorId: string
  content: string
  createdAt: string
  status: ChatStatus
  attachments?: ChatAttachment[]
}

export type ChatMessageGroup = {
  authorId: string
  messages: ChatMessage[]
}

export type ChannelChatSnapshot = {
  messages: ChatMessage[]
  draft: string
  attachments: ChatAttachment[]
  visibleCount: number
}


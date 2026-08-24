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
  fileUrl?: string
  thumbnailUrl?: string | null
  fileType?: string
  fileSize?: number
}

export type ComposerAttachmentStatus = 'pending' | 'uploading' | 'uploaded' | 'error'

export type ComposerAttachment = {
  id: string
  file: File
  name: string
  sizeLabel: string
  fileType: string
  fileSize: number
  previewUrl: string | null
  previewKind: 'image' | 'video' | 'audio' | 'file'
  status: ComposerAttachmentStatus
  progress: number
  errorMessage?: string | null
  fileUrl?: string
  thumbnailUrl?: string | null
  publicId?: string
  resourceType?: string
  format?: string
}

export type ChatReaction = {
  emoji: string
  count: number
  users: string[]
  reactedByCurrentUser?: boolean
}

export type ChatMessage = {
  id: string
  authorId: string
  content: string
  createdAt: string
  status: ChatStatus
  attachments?: ChatAttachment[]
  reactions?: ChatReaction[]
  isPinned?: boolean
}

export type ChatMessageGroup = {
  authorId: string
  messages: ChatMessage[]
}

export type ChannelChatSnapshot = {
  messages: ChatMessage[]
  draft: string
  attachments: ComposerAttachment[]
  visibleCount: number
  lastReadMessageId: string | null
}


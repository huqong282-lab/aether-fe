import type {
  ChatAttachment,
  ChatMember,
  ChatMessage,
  ChatMessageGroup,
  ComposerAttachment,
  PresenceState,
} from './chat.types'

export const DEFAULT_VISIBLE_MESSAGE_COUNT = 10
export const LOAD_MORE_STEP = 6

export function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function formatMessageTime(isoDate: string) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function formatLongMessageTime(isoDate: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function getPresenceTone(state: PresenceState) {
  return {
    online: 'bg-[#3BA55D]',
    idle: 'bg-[#FAA61A]',
    dnd: 'bg-[#ED4245]',
    offline: 'bg-[#747F8D]',
  }[state]
}

export function getActiveMentionRange(value: string, cursor: number) {
  const beforeCursor = value.slice(0, cursor)
  const match = beforeCursor.match(/(^|\s)@([a-zA-Z0-9_.-]*)$/)

  if (!match) {
    return null
  }

  const query = match[2] ?? ''
  const start = beforeCursor.length - query.length - 1

  return {
    query,
    start,
    end: cursor,
  }
}

export function groupMessages(messages: ChatMessage[]): ChatMessageGroup[] {
  const groups: ChatMessageGroup[] = []

  for (const message of messages) {
    const lastGroup = groups[groups.length - 1]

    if (lastGroup && lastGroup.authorId === message.authorId) {
      lastGroup.messages.push(message)
      continue
    }

    groups.push({
      authorId: message.authorId,
      messages: [message],
    })
  }

  return groups
}

export function createChatMembers(
  workspaceId: string,
  workspaceName: string,
  currentUser: { id: string; name?: string | null; username: string } | null,
) {
  const currentName = currentUser?.name?.trim() || currentUser?.username?.trim() || 'You'
  const currentHandle = currentUser?.username?.trim() || 'you'

  return [
    {
      id: currentUser?.id ?? 'current-user',
      name: currentName,
      handle: currentHandle,
      presence: 'online' as const,
      accent: 'from-fuchsia-500 to-rose-500',
    },
    {
      id: `${workspaceId}-owner`,
      name: `${workspaceName} Owner`,
      handle: 'owner',
      presence: 'online' as const,
      accent: 'from-sky-400 to-cyan-500',
    },
    {
      id: `${workspaceId}-mod`,
      name: 'Raka',
      handle: 'raka',
      presence: 'idle' as const,
      accent: 'from-emerald-400 to-teal-500',
    },
    {
      id: `${workspaceId}-member-1`,
      name: 'Dita',
      handle: 'dita',
      presence: 'online' as const,
      accent: 'from-violet-400 to-indigo-500',
    },
    {
      id: `${workspaceId}-member-2`,
      name: 'Fajar',
      handle: 'fajar',
      presence: 'dnd' as const,
      accent: 'from-amber-400 to-orange-500',
    },
    {
      id: `${workspaceId}-member-3`,
      name: 'Nadia',
      handle: 'nadia',
      presence: 'offline' as const,
      accent: 'from-slate-400 to-slate-600',
    },
  ]
}

export function createSeedMessages(
  channelId: string,
  workspaceName: string,
  channelName: string,
  members: ChatMember[],
  currentUserId: string,
) {
  const authorIds = members.map((member) => member.id)
  const pickAuthor = (index: number) => authorIds[index % authorIds.length]
  const now = Date.now()
  const baseLabel = `${workspaceName} • ${channelName}`

  const seeds: Array<Omit<ChatMessage, 'id' | 'createdAt'>> = [
    {
      authorId: pickAuthor(1),
      content: `Selamat datang di ${baseLabel}. Kita bisa pakai thread ini untuk cek FE6.1.`,
      status: 'sent',
      reactions: [
        { emoji: '👀', count: 2, users: ['Raka', 'Dita'] },
      ],
    },
    {
      authorId: pickAuthor(2),
      content: 'MessageList perlu infinite scroll yang tetap menjaga posisi saat pesan lama dimuat.',
      status: 'sent',
      isPinned: true,
      reactions: [
        { emoji: '🔥', count: 3, users: ['Fajar', 'Nadia', 'You'] },
      ],
    },
    {
      authorId: pickAuthor(2),
      content: 'Grouping harus menyatukan pesan berurutan dari user yang sama supaya rapi.',
      status: 'sent',
    },
    {
      authorId: pickAuthor(3),
      content: 'Composer juga perlu mention popup ketika kita mengetik @ dan memilih member dari daftar.',
      status: 'sent',
    },
    {
      authorId: currentUserId,
      content: 'Aku sedang cek optimistic send, status sent/failed, dan retry dari UI.',
      status: 'sent',
      reactions: [
        { emoji: '✅', count: 1, users: ['Raka'] },
      ],
    },
    {
      authorId: pickAuthor(4),
      content: 'Mantap. Kalau ada pesan gagal, tampilkan state failed plus tombol retry ya.',
      status: 'sent',
    },
    {
      authorId: currentUserId,
      content: 'Contoh pesan gagal untuk demo state failed.',
      status: 'failed',
    },
    {
      authorId: currentUserId,
      content: 'Pesan pending dipakai saat sedang menunggu konfirmasi server.',
      status: 'sending',
    },
    {
      authorId: pickAuthor(5),
      content: 'Mention autocomplete juga enak kalau hasilnya memfilter member yang relevan.',
      status: 'sent',
    },
    {
      authorId: pickAuthor(1),
      content: 'Dan jangan lupa composer auto-resize supaya input panjang tetap nyaman.',
      status: 'sent',
      isPinned: true,
    },
    {
      authorId: currentUserId,
      content: 'Siap, kita jaga agar backend tidak disentuh dan semua tetap di sisi frontend.',
      status: 'sent',
    },
    {
      authorId: pickAuthor(2),
      content: 'Saran kecil: sent/failed bisa dipakai sebagai badge status di setiap MessageItem.',
      status: 'sent',
    },
  ]

  return seeds.map((seed, index) => ({
    id: `${channelId}-message-${index + 1}`,
    authorId: seed.authorId,
    content: seed.content,
    status: seed.status,
    reactions: seed.reactions,
    isPinned: seed.isPinned,
    createdAt: new Date(now - (seeds.length - index) * 4 * 60 * 1000).toISOString(),
  }))
}

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'])
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const AUDIO_MIME_TYPES = new Set(['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'])

export const MAX_UPLOAD_SIZE_BYTES = 1024 * 1024 * 1024

export function isSupportedUploadType(fileType: string) {
  return (
    IMAGE_MIME_TYPES.has(fileType) ||
    VIDEO_MIME_TYPES.has(fileType) ||
    AUDIO_MIME_TYPES.has(fileType) ||
    fileType === 'application/pdf' ||
    fileType === 'application/zip' ||
    fileType === 'application/x-zip-compressed'
  )
}

export function getComposerAttachmentPreviewKind(fileType: string): ComposerAttachment['previewKind'] {
  if (IMAGE_MIME_TYPES.has(fileType)) {
    return 'image'
  }

  if (VIDEO_MIME_TYPES.has(fileType)) {
    return 'video'
  }

  if (AUDIO_MIME_TYPES.has(fileType)) {
    return 'audio'
  }

  return 'file'
}

export function toAttachmentPreview(file: File): ComposerAttachment {
  return {
    id: createId('attachment'),
    file,
    name: file.name,
    sizeLabel: formatFileSize(file.size),
    fileType: file.type || 'application/octet-stream',
    fileSize: file.size,
    previewUrl: typeof URL !== 'undefined' ? URL.createObjectURL(file) : null,
    previewKind: getComposerAttachmentPreviewKind(file.type || 'application/octet-stream'),
    status: 'pending',
    progress: 0,
  }
}

export function toMessageAttachment(attachment: {
  id: string
  fileName: string
  fileSize: number | string
  fileUrl: string
  thumbnailUrl: string | null
  fileType: string
}): ChatAttachment {
  return {
    id: attachment.id,
    name: attachment.fileName,
    sizeLabel: formatFileSize(Number(attachment.fileSize)),
    fileUrl: attachment.fileUrl,
    thumbnailUrl: attachment.thumbnailUrl,
    fileType: attachment.fileType,
    fileSize: Number(attachment.fileSize),
  }
}


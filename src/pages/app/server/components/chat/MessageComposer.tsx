import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ComposerAttachment, ChatMember } from './chat.types'
import { MentionAutocomplete } from './MentionAutocomplete'

type AttachFilesOptions = {
  replaceAttachmentId?: string
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M4 17.5V20h2.5L18.9 7.6l-2.5-2.5L4 17.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14.4 5.1l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4.5 7h15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7m-7.5 0 .8 11.2A1.5 1.5 0 0 0 9.8 19h4.4a1.5 1.5 0 0 0 1.5-1.8L16.5 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function EmojiIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9 14.5c.8.9 1.8 1.4 3 1.4s2.2-.5 3-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 10.2h.01M14.5 10.2h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 12l15-8-4.5 8L19 20 4 12z" fill="currentColor" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 16V5m0 0l-4 4m4-4l4 4M5 19h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M14 3H8a2 2 0 00-2 2v14a2 2 0 002 2h8a2 2 0 002-2V9l-4-6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function ComposerTextarea({
  value,
  onChange,
  onSubmit,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }

    textarea.style.height = '0px'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          onSubmit()
        }
      }}
      placeholder="Tulis pesan ke channel ini... ketik @ untuk mention member"
      className="min-h-[44px] w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-slate-500"
      rows={1}
    />
  )
}

function ActionButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
      aria-label={label}
    >
      {children}
    </button>
  )
}

function SendButton({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2] text-white transition hover:bg-[#4752c4] disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-slate-500"
      aria-label="Send message"
    >
      <SendIcon />
    </button>
  )
}

function AttachmentStatusBar({
  progress,
  status,
}: {
  progress: number
  status: ComposerAttachment['status']
}) {
  const width = `${Math.max(0, Math.min(100, progress))}%`
  const label =
    status === 'uploading'
      ? `Uploading... ${Math.round(progress)}%`
      : status === 'error'
        ? 'Gagal upload'
        : 'Upload selesai'

  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={[
            'h-full rounded-full transition-all duration-200',
            status === 'error' ? 'bg-rose-400' : status === 'uploaded' ? 'bg-emerald-400' : 'bg-[#5865F2]',
          ].join(' ')}
          style={{ width }}
        />
      </div>
    </div>
  )
}

function AttachmentPreviewCard({
  attachment,
  onView,
  onEdit,
  onRemove,
}: {
  attachment: ComposerAttachment
  onView: (attachment: ComposerAttachment) => void
  onEdit: (attachmentId: string) => void
  onRemove: (attachmentId: string) => void
}) {
  const isImage = attachment.previewKind === 'image' && attachment.previewUrl
  const showProgress = attachment.status === 'uploading' || attachment.status === 'error'
  const fileSuffix = attachment.fileType.split('/')[1] || 'file'

  return (
    <article className="group relative w-full max-w-[340px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#2a2c31] p-3">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-[14px] border border-white/[0.08] bg-[#3b3d44]/95 p-1 text-slate-200 opacity-90 shadow-lg transition group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onView(attachment)}
          className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-white/[0.08]"
          aria-label={`View ${attachment.name}`}
          title="View"
        >
          <EyeIcon />
        </button>
        <button
          type="button"
          onClick={() => onEdit(attachment.id)}
          className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-white/[0.08]"
          aria-label={`Edit ${attachment.name}`}
          title="Edit"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          onClick={() => onRemove(attachment.id)}
          className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-white/[0.08]"
          aria-label={`Delete ${attachment.name}`}
          title="Delete"
        >
          <TrashIcon />
        </button>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-white/[0.06] bg-[#1e1f24]">
        <div className="relative flex items-center justify-center">
          {isImage ? (
            <img
              src={attachment.previewUrl ?? undefined}
              alt={attachment.name}
              className="h-[210px] w-full object-cover"
            />
          ) : attachment.previewKind === 'video' ? (
            <div className="flex h-[210px] w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-5xl">
              🎥
            </div>
          ) : attachment.previewKind === 'audio' ? (
            <div className="flex h-[210px] w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-5xl">
              🎧
            </div>
          ) : (
            <div className="flex h-[210px] w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-slate-200">
              <div className="flex flex-col items-center gap-3">
                <FileIcon />
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {fileSuffix}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.06] bg-[#2a2c31] px-1.5 py-3">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="min-w-0">
              <div className="truncate text-[15px] font-medium text-white">{attachment.name}</div>
            </div>

            <button
              type="button"
              onClick={() => onRemove(attachment.id)}
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
              aria-label={`Remove ${attachment.name}`}
            >
              <TrashIcon />
            </button>
          </div>

          {showProgress ? <AttachmentStatusBar progress={attachment.progress} status={attachment.status} /> : null}

          {attachment.status === 'error' && attachment.errorMessage ? (
            <p className="mt-2 px-1 text-xs text-rose-200">{attachment.errorMessage}</p>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function ReadyAttachmentChip({
  attachment,
  onView,
  onEdit,
  onRemove,
}: {
  attachment: ComposerAttachment
  onView: (attachment: ComposerAttachment) => void
  onEdit: (attachmentId: string) => void
  onRemove: (attachmentId: string) => void
}) {
  return (
    <div className="group inline-flex items-center gap-2 rounded-full border border-emerald-400/18 bg-emerald-400/10 px-2.5 py-2 text-xs text-emerald-50">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/20 text-[10px] font-bold text-emerald-100">
        ✓
      </span>
      <div className="min-w-0">
        <div className="max-w-[180px] truncate font-semibold leading-4">{attachment.name}</div>
        <div className="text-[11px] text-emerald-100/75">{attachment.sizeLabel} • ready to send</div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onView(attachment)}
          className="rounded-full px-2 py-1 text-[11px] font-semibold text-emerald-50/85 transition hover:bg-white/[0.08]"
          aria-label={`View ${attachment.name}`}
          title="View"
        >
          <EyeIcon />
        </button>
        <button
          type="button"
          onClick={() => onEdit(attachment.id)}
          className="rounded-full px-2 py-1 text-[11px] font-semibold text-emerald-50/85 transition hover:bg-white/[0.08]"
          aria-label={`Edit ${attachment.name}`}
          title="Edit"
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          onClick={() => onRemove(attachment.id)}
          className="rounded-full px-2 py-1 text-[11px] font-semibold text-emerald-50/85 transition hover:bg-white/[0.08]"
          aria-label={`Delete ${attachment.name}`}
          title="Delete"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

export function MessageComposer({
  draft,
  attachments,
  members,
  mentionRange,
  mentionQuery,
  onDraftChange,
  onSubmit,
  onAttachFiles,
  onPickMention,
  onRemoveAttachment,
  onRemoveAllAttachments,
  canSend = true,
}: {
  draft: string
  attachments: ComposerAttachment[]
  members: ChatMember[]
  mentionRange: { start: number; end: number } | null
  mentionQuery: string
  onDraftChange: (value: string) => void
  onSubmit: () => void
  onAttachFiles: (files: FileList | File[], options?: AttachFilesOptions) => void | Promise<void>
  onPickMention: (member: ChatMember) => void
  onRemoveAttachment: (attachmentId: string) => void
  onRemoveAllAttachments: () => void
  canSend?: boolean
}) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [editingAttachmentId, setEditingAttachmentId] = useState<string | null>(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(false)
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target)) {
        setActionMenuOpen(false)
        setEmojiMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActionMenuOpen(false)
        setEmojiMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleEmojiPick = (emoji: string) => {
    onDraftChange(`${draft}${emoji}`)
    setEmojiMenuOpen(false)
  }

  const handleViewAttachment = (attachment: ComposerAttachment) => {
    const targetUrl = attachment.fileUrl || attachment.previewUrl
    if (!targetUrl || typeof window === 'undefined') {
      return
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  const handleEditAttachment = (attachmentId: string) => {
    setEditingAttachmentId(attachmentId)
    fileInputRef.current?.click()
  }

  const handleUploadFiles = (files: FileList | File[]) => {
    onAttachFiles(files, editingAttachmentId ? { replaceAttachmentId: editingAttachmentId } : undefined)
    setEditingAttachmentId(null)
    setActionMenuOpen(false)
  }

  const uploadingAttachments = attachments.filter((attachment) => attachment.status !== 'uploaded')
  const readyAttachments = attachments.filter((attachment) => attachment.status === 'uploaded')

  return (
    <div ref={rootRef} className="rounded-[28px] border border-white/[0.06] bg-[#2f3136] px-4 py-4 shadow-[0_-16px_40px_rgba(0,0,0,0.12)]">
      {uploadingAttachments.length > 0 ? (
        <div className="mb-3 space-y-2">
          {uploadingAttachments.map((attachment) => (
            <AttachmentPreviewCard
              key={attachment.id}
              attachment={attachment}
              onView={handleViewAttachment}
              onEdit={handleEditAttachment}
              onRemove={onRemoveAttachment}
            />
          ))}
        </div>
      ) : null}

      {readyAttachments.length > 0 ? (
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span>Ready to send</span>
            <button
              type="button"
              onClick={onRemoveAllAttachments}
              className="text-slate-400 transition hover:text-white"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {readyAttachments.map((attachment) => (
              <ReadyAttachmentChip
                key={attachment.id}
                attachment={attachment}
                onView={handleViewAttachment}
                onEdit={handleEditAttachment}
                onRemove={onRemoveAttachment}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative">
        {mentionRange ? (
          <div className="absolute bottom-full left-0 z-20 mb-3 w-full max-w-md">
            <MentionAutocomplete query={mentionQuery} members={members} onPick={onPickMention} />
          </div>
        ) : null}

        {actionMenuOpen ? (
          <div className="absolute bottom-full left-0 z-30 mb-3 w-72 overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#202225] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-white/[0.05]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] text-white">
                <UploadIcon />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">Upload a File</span>
                <span className="block text-xs text-slate-400">Upload langsung ke Cloudinary</span>
              </span>
            </button>
          </div>
        ) : null}

        <div className="flex items-end gap-3 rounded-[26px] border border-white/[0.08] bg-[#202225] px-4 py-3">
          <ActionButton onClick={() => setActionMenuOpen((current) => !current)} label="Open attachment menu">
            <PlusIcon />
          </ActionButton>

          <div className="min-w-0 flex-1">
            <ComposerTextarea value={draft} onChange={onDraftChange} onSubmit={onSubmit} />
          </div>

          <div className="relative flex items-center gap-2">
            <ActionButton onClick={() => setEmojiMenuOpen((current) => !current)} label="Insert emoji">
              <EmojiIcon />
            </ActionButton>
            <SendButton onClick={onSubmit} disabled={!canSend} />

            {emojiMenuOpen ? (
              <div className="absolute bottom-full right-0 z-30 mb-3 w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#202225] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
                <div className="grid grid-cols-4 gap-1 p-2">
                  {['✨', '🔥', '💡', '🎉', '✅', '🚀', '📝', '👀'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiPick(emoji)}
                      className="rounded-xl px-2 py-3 text-lg transition hover:bg-white/[0.06]"
                      aria-label={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            handleUploadFiles(event.target.files)
          }

          event.target.value = ''
        }}
      />
    </div>
  )
}

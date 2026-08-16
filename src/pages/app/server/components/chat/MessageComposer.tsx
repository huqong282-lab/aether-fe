import { useEffect, useRef, useState } from 'react'
import type { ChatAttachment, ChatMember } from './chat.types'
import { MentionAutocomplete } from './MentionAutocomplete'

function AttachIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12.5 6.5l-6.2 6.2a3 3 0 104.2 4.2l7-7a5 5 0 10-7.1-7.1l-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function AttachButton({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
      aria-label="Attach file"
    >
      <AttachIcon />
    </button>
  )
}

function EmojiButton({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
      aria-label="Insert emoji"
    >
      <EmojiIcon />
    </button>
  )
}

function SendButton({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#5865F2] text-white transition hover:bg-[#4752c4]"
      aria-label="Send message"
    >
      <SendIcon />
    </button>
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
}: {
  draft: string
  attachments: ChatAttachment[]
  members: ChatMember[]
  mentionRange: { start: number; end: number } | null
  mentionQuery: string
  onDraftChange: (value: string) => void
  onSubmit: () => void
  onAttachFiles: (files: FileList | File[]) => void
  onPickMention: (member: ChatMember) => void
  onRemoveAttachment: (attachmentId: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [emojiMenuOpen, setEmojiMenuOpen] = useState(false)

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (!fileInputRef.current?.parentElement?.contains(target)) {
        setEmojiMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  const handleEmojiPick = (emoji: string) => {
    onDraftChange(`${draft}${emoji}`)
    setEmojiMenuOpen(false)
  }

  return (
    <div className="rounded-[28px] border border-white/[0.06] bg-[#2f3136] px-4 py-4 shadow-[0_-16px_40px_rgba(0,0,0,0.12)]">
      {attachments.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-slate-300"
            >
              <span className="max-w-[220px] truncate font-semibold text-white">{attachment.name}</span>
              <span className="text-slate-500">{attachment.sizeLabel}</span>
              <button
                type="button"
                onClick={() => onRemoveAttachment(attachment.id)}
                className="rounded-full px-1.5 py-0.5 text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
                aria-label={`Remove ${attachment.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="relative">
        {mentionRange ? (
          <div className="absolute bottom-full left-0 z-20 mb-3 w-full max-w-md">
            <MentionAutocomplete query={mentionQuery} members={members} onPick={onPickMention} />
          </div>
        ) : null}

        <div className="flex items-end gap-3 rounded-[26px] border border-white/[0.08] bg-[#202225] px-4 py-3">
          <AttachButton onClick={() => fileInputRef.current?.click()} />

          <div className="min-w-0 flex-1">
            <ComposerTextarea value={draft} onChange={onDraftChange} onSubmit={onSubmit} />
          </div>

          <div className="relative flex items-center gap-2">
            <EmojiButton onClick={() => setEmojiMenuOpen((current) => !current)} />
            <SendButton onClick={onSubmit} />

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
            onAttachFiles(event.target.files)
          }

          event.target.value = ''
        }}
      />
    </div>
  )
}


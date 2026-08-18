import { useLayoutEffect, useMemo, useRef } from 'react'
import type { ChatMember, ChatMessage } from './chat.types'
import { DEFAULT_VISIBLE_MESSAGE_COUNT, groupMessages } from './chat.utils'
import { MessageGroup } from './MessageGroup'

type ScrollSnapshot = {
  prevHeight: number
  prevScrollTop: number
}

export function MessageList({
  scrollKey,
  messages,
  members,
  hasOlderMessages,
  onLoadOlderMessages,
  highlightedMessageId,
  onJumpToMessage,
  onTogglePin,
  onReact,
  onRetryMessage,
}: {
  scrollKey: string
  messages: ChatMessage[]
  members: ChatMember[]
  hasOlderMessages: boolean
  onLoadOlderMessages: () => void
  highlightedMessageId: string | null
  onJumpToMessage: (messageId: string) => void
  onTogglePin: (messageId: string) => void
  onReact: (messageId: string, emoji: string) => void
  onRetryMessage: (messageId: string) => void
}) {
  const listRef = useRef<HTMLDivElement | null>(null)
  const didInitialScrollRef = useRef<string | null>(null)
  const stickToBottomRef = useRef(true)
  const preserveScrollRef = useRef<ScrollSnapshot | null>(null)
  const previousMessageCountRef = useRef(messages.length)

  const groupedMessages = useMemo(() => groupMessages(messages), [messages])

  const scrollToBottom = () => {
    const node = listRef.current
    if (!node) {
      return
    }

    node.scrollTop = node.scrollHeight
  }

  useLayoutEffect(() => {
    const node = listRef.current
    if (!node) {
      return
    }

    if (didInitialScrollRef.current !== scrollKey) {
      didInitialScrollRef.current = scrollKey
      stickToBottomRef.current = true
      previousMessageCountRef.current = messages.length
      scrollToBottom()
      return
    }

    const preserveSnapshot = preserveScrollRef.current
    if (preserveSnapshot) {
      const nextHeight = node.scrollHeight
      node.scrollTop = nextHeight - preserveSnapshot.prevHeight + preserveSnapshot.prevScrollTop
      preserveScrollRef.current = null
      previousMessageCountRef.current = messages.length
      return
    }

    const hasNewMessage = messages.length > previousMessageCountRef.current
    if (stickToBottomRef.current && hasNewMessage) {
      scrollToBottom()
    }

    previousMessageCountRef.current = messages.length
  }, [messages.length, scrollKey])

  useLayoutEffect(() => {
    if (!highlightedMessageId) {
      return
    }

    const target = document.getElementById(`message-${highlightedMessageId}`)
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightedMessageId, messages.length])

  return (
    <div
      ref={listRef}
      className="min-h-0 flex-1 overflow-y-auto scroll-smooth pr-1"
      onScroll={(event) => {
        const node = event.currentTarget
        stickToBottomRef.current = node.scrollHeight - node.scrollTop - node.clientHeight < 140

        const isNearTop = node.scrollTop <= 48
        if (isNearTop && hasOlderMessages) {
          preserveScrollRef.current = {
            prevHeight: node.scrollHeight,
            prevScrollTop: node.scrollTop,
          }
          onLoadOlderMessages()
        }
      }}
    >
      <div className="space-y-4 pb-4">
        {hasOlderMessages ? (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => {
                const node = listRef.current
                if (!node) {
                  return
                }

                preserveScrollRef.current = {
                  prevHeight: node.scrollHeight,
                  prevScrollTop: node.scrollTop,
                }
                onLoadOlderMessages()
              }}
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Load older messages
            </button>
          </div>
        ) : null}

        {groupedMessages.map((group) => (
          <MessageGroup
            key={`${group.authorId}-${group.messages[0]?.id}`}
            group={group}
            members={members}
            highlightedMessageId={highlightedMessageId}
            onJump={onJumpToMessage}
            onTogglePin={onTogglePin}
            onReact={onReact}
            onRetry={onRetryMessage}
          />
        ))}
      </div>
    </div>
  )
}

export const MESSAGE_LIST_DEFAULT_VISIBLE_COUNT = DEFAULT_VISIBLE_MESSAGE_COUNT


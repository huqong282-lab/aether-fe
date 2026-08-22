import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { SearchIcon } from '../app-icons'
import {
  searchRequest,
  type SearchChannelResult,
  type SearchEntityType,
  type SearchFileResult,
  type SearchMessageResult,
  type SearchUserResult,
} from '../../../lib/search/search.api'

type SearchScope = {
  serverId: string | null
  serverName?: string | null
  channelId?: string | null
}

type SearchOverlayProps = {
  open: boolean
  scope: SearchScope
  onClose: () => void
}

type SearchTab = SearchEntityType

const tabs: Array<{ value: SearchTab; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'message', label: 'Messages' },
  { value: 'file', label: 'Files' },
  { value: 'channel', label: 'Channels' },
  { value: 'user', label: 'Users' },
]

function formatRelativeTime(value?: string) {
  if (!value) {
    return null
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function ResultBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
      {label}
    </span>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/[0.06] bg-white/[0.03] px-5 py-6 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  )
}

function MessageResultItem({
  result,
  onSelect,
}: {
  result: SearchMessageResult
  onSelect: (result: SearchMessageResult) => void
}) {
  const meta = [result.channelName ? `#${result.channelName}` : null, formatRelativeTime(result.createdAt)]
    .filter(Boolean)
    .join(' • ')

  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left transition hover:border-[#5865F2]/30 hover:bg-[#5865F2]/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{result.content?.trim() || result.snippet || 'Message'}</p>
          <p className="mt-1 text-xs text-slate-400">{meta || result.serverName || 'Message result'}</p>
          {result.authorName ? <p className="mt-1 text-xs text-slate-500">by {result.authorName}</p> : null}
        </div>
        <ResultBadge label="Message" />
      </div>
    </button>
  )
}

function ChannelResultItem({
  result,
  onSelect,
}: {
  result: SearchChannelResult
  onSelect: (result: SearchChannelResult) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left transition hover:border-[#5865F2]/30 hover:bg-[#5865F2]/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">#{result.name || result.id}</p>
          <p className="mt-1 text-xs text-slate-400">{result.topic || result.serverName || 'Channel result'}</p>
        </div>
        <ResultBadge label={result.type ? result.type.toUpperCase() : 'Channel'} />
      </div>
    </button>
  )
}

function FileResultItem({
  result,
  onSelect,
}: {
  result: SearchFileResult
  onSelect: (result: SearchFileResult) => void
}) {
  const title = result.fileName || result.snippet || 'File'

  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left transition hover:border-[#5865F2]/30 hover:bg-[#5865F2]/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-slate-400">{result.channelName || result.serverName || 'File result'}</p>
        </div>
        <ResultBadge label="File" />
      </div>
    </button>
  )
}

function UserResultItem({
  result,
  onSelect,
}: {
  result: SearchUserResult
  onSelect: (result: SearchUserResult) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-left transition hover:border-[#5865F2]/30 hover:bg-[#5865F2]/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{result.displayName || result.username || result.id}</p>
          <p className="mt-1 text-xs text-slate-400">{result.email || result.serverName || 'User result'}</p>
        </div>
        <ResultBadge label="User" />
      </div>
    </button>
  )
}

export function SearchOverlay({ open, scope, onClose }: SearchOverlayProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeTab, setActiveTab] = useState<SearchTab>('all')

  useEffect(() => {
    if (!open) {
      return
    }

    inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 250)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setDebouncedQuery('')
      setActiveTab('all')
    }
  }, [open])

  const searchMutation = useMutation({
    mutationFn: async () => {
      if (!scope.serverId || debouncedQuery.length < 2) {
        return null
      }

      return searchRequest({
        q: debouncedQuery,
        serverId: scope.serverId,
        channelId: scope.channelId ?? undefined,
        type: activeTab === 'all' ? undefined : activeTab,
        limit: 10,
      })
    },
  })

  useEffect(() => {
    if (!open || !scope.serverId || debouncedQuery.length < 2) {
      return
    }

    searchMutation.mutate()
    // Search is intentionally live as the user types and changes the filter tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, debouncedQuery, open, scope.serverId, scope.channelId])

  const resultGroups = useMemo(() => {
    const response = searchMutation.data?.data ?? {}

    return {
      messages: response.messages ?? [],
      files: response.files ?? [],
      channels: response.channels ?? [],
      users: response.users ?? [],
    }
  }, [searchMutation.data])

  const hasSearchResults =
    resultGroups.messages.length > 0 ||
    resultGroups.files.length > 0 ||
    resultGroups.channels.length > 0 ||
    resultGroups.users.length > 0

  const handleOpenMessage = (result: SearchMessageResult) => {
    if (!result.channelId || !result.serverId) {
      return
    }

    onClose()
    navigate(`/app/servers/${result.serverId}/channels/${result.channelId}?messageId=${result.id}`)
  }

  const handleOpenChannel = (result: SearchChannelResult) => {
    if (!result.serverId) {
      return
    }

    onClose()
    navigate(`/app/servers/${result.serverId}/channels/${result.id}`)
  }

  const handleOpenFile = (result: SearchFileResult) => {
    if (result.fileUrl) {
      window.open(result.fileUrl, '_blank', 'noopener,noreferrer')
    }

    onClose()
  }

  const handleOpenUser = () => {
    onClose()
  }

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-8"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        className="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#2b2d31] shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-overlay-title"
      >
        <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p id="search-overlay-title" className="text-xl font-semibold text-white">
                Search
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {scope.serverName ? `Search in ${scope.serverName}` : 'Pick a server to search'}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#202225] px-4 py-3 text-slate-300">
            <SearchIcon className="h-5 w-5 text-slate-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search messages, files, channels, users"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.value

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={[
                    'rounded-full border px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'border-[#5865F2]/35 bg-[#5865F2]/18 text-white'
                      : 'border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white',
                  ].join(' ')}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {!scope.serverId ? (
            <EmptyState
              title="Select a server first"
              description="Search Overlay needs an active server context so results can be grouped and jumped to correctly."
            />
          ) : debouncedQuery.length < 2 ? (
            <EmptyState
              title="Start typing to search"
              description="Search results will appear grouped by entity type once your query has at least 2 characters."
            />
          ) : searchMutation.isPending ? (
            <EmptyState title="Searching..." description="Please wait while we load grouped results." />
          ) : searchMutation.isError ? (
            <EmptyState
              title="Search failed"
              description="The search endpoint returned an error. Please try again in a moment."
            />
          ) : !hasSearchResults ? (
            <EmptyState
              title="No results"
              description="Try a different keyword or switch the entity filter to narrow the search."
            />
          ) : (
            <div className="space-y-6">
              {(activeTab === 'all' || activeTab === 'message') && resultGroups.messages.length > 0 ? (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Messages</h2>
                    <span className="text-xs text-slate-500">{resultGroups.messages.length}</span>
                  </div>
                  <div className="space-y-2">
                    {resultGroups.messages.map((result) => (
                      <MessageResultItem key={result.id} result={result} onSelect={handleOpenMessage} />
                    ))}
                  </div>
                </section>
              ) : null}

              {(activeTab === 'all' || activeTab === 'file') && resultGroups.files.length > 0 ? (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Files</h2>
                    <span className="text-xs text-slate-500">{resultGroups.files.length}</span>
                  </div>
                  <div className="space-y-2">
                    {resultGroups.files.map((result) => (
                      <FileResultItem key={result.id} result={result} onSelect={handleOpenFile} />
                    ))}
                  </div>
                </section>
              ) : null}

              {(activeTab === 'all' || activeTab === 'channel') && resultGroups.channels.length > 0 ? (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Channels</h2>
                    <span className="text-xs text-slate-500">{resultGroups.channels.length}</span>
                  </div>
                  <div className="space-y-2">
                    {resultGroups.channels.map((result) => (
                      <ChannelResultItem key={result.id} result={result} onSelect={handleOpenChannel} />
                    ))}
                  </div>
                </section>
              ) : null}

              {(activeTab === 'all' || activeTab === 'user') && resultGroups.users.length > 0 ? (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Users</h2>
                    <span className="text-xs text-slate-500">{resultGroups.users.length}</span>
                  </div>
                  <div className="space-y-2">
                    {resultGroups.users.map((result) => (
                      <UserResultItem key={result.id} result={result} onSelect={handleOpenUser} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

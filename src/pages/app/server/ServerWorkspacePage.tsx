import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../state/auth.state'
import { useServerRailStore } from '../../../state/server.state'
import {
  getServerByIdRequest,
  getOwnedServersRequest,
  ownedServersQueryKey,
  type ServerRecord,
} from '../../../lib/server/server.api'
import {
  getServerCategoriesRequest,
  getServerChannelsRequest,
  serverWorkspaceQueryKeys,
  type ServerCategoryRecord,
  type ServerChannelRecord,
  type ServerWorkspaceRecord,
} from '../../../lib/server/server-workspace.api'
import { AppCreateServerModal } from '../components/AppCreateServerModal'
import { useChannelReadStore } from '../../../state/channel.state'
import { AppServerRail } from '../components/AppServerRail'
import { AppUserPanel } from '../components/AppUserPanel'
import { ServerChannelMain } from './components/ServerChannelMain'
import { ServerChannelSidebar } from './components/ServerChannelSidebar'

function sortByPosition<T extends { position: number }>(items: T[]) {
  return [...items].sort((left, right) => left.position - right.position)
}

function buildWorkspace(
  server: ServerRecord,
  categories: ServerCategoryRecord[],
  channels: ServerChannelRecord[],
): ServerWorkspaceRecord {
  return {
    server,
    categories: sortByPosition(categories),
    channels: sortByPosition(channels),
  }
}

export function ServerWorkspacePage() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const params = useParams<{ serverId: string; channelId?: string }>()
  const serverId = params.serverId ?? null
  const channelId = params.channelId ?? null
  const [isCreateServerOpen, setIsCreateServerOpen] = useState(false)
  const setActiveServerId = useServerRailStore((state) => state.setActiveServerId)
  const markChannelRead = useChannelReadStore((state) => state.markChannelRead)

  const ownedServersQuery = useQuery({
    queryKey: ownedServersQueryKey,
    queryFn: getOwnedServersRequest,
    select: (response) => response.data,
    enabled: Boolean(user),
  })

  const workspaceQuery = useQuery({
    queryKey: serverWorkspaceQueryKeys.server(serverId ?? 'missing'),
    queryFn: async () => {
      if (!serverId) {
        return null
      }

      const [serverResponse, categoriesResponse, channelsResponse] = await Promise.all([
        getServerByIdRequest(serverId).then((response) => response.data),
        getServerCategoriesRequest(serverId).then((response) => response.data),
        getServerChannelsRequest(serverId).then((response) => response.data),
      ])

      if (!serverResponse) {
        return null
      }

      return buildWorkspace(serverResponse, categoriesResponse, channelsResponse)
    },
    enabled: Boolean(serverId),
  })

  const servers = useMemo(() => {
    const mergedServers = [...(ownedServersQuery.data ?? [])].reduce<ServerRecord[]>((accumulator, server) => {
      if (accumulator.some((item) => item.id === server.id)) {
        return accumulator
      }

      return [...accumulator, server]
    }, [])

    return mergedServers
  }, [ownedServersQuery.data])

  const workspace = workspaceQuery.data ?? null

  const channelsByCategory = useMemo(() => {
    if (!workspace) {
      return {
        categorizedChannels: new Map<string, ServerChannelRecord[]>(),
        uncategorizedChannels: [] as ServerChannelRecord[],
      }
    }

    const categorizedChannels = new Map<string, ServerChannelRecord[]>()
    const uncategorizedChannels: ServerChannelRecord[] = []

    for (const channel of workspace.channels) {
      if (channel.categoryId) {
        const current = categorizedChannels.get(channel.categoryId) ?? []
        categorizedChannels.set(channel.categoryId, [...current, channel])
        continue
      }

      uncategorizedChannels.push(channel)
    }

    for (const [categoryId, channelList] of categorizedChannels.entries()) {
      categorizedChannels.set(categoryId, sortByPosition(channelList))
    }

    return {
      categorizedChannels,
      uncategorizedChannels: sortByPosition(uncategorizedChannels),
    }
  }, [workspace])

  const resolvedChannelId = useMemo(() => {
    if (!workspace?.channels.length) {
      return null
    }

    if (channelId && workspace.channels.some((channel) => channel.id === channelId)) {
      return channelId
    }

    return workspace.channels[0]?.id ?? null
  }, [channelId, workspace?.channels])

  useEffect(() => {
    if (serverId) {
      setActiveServerId(serverId)
    }
  }, [serverId, setActiveServerId])

  useEffect(() => {
    if (!serverId || !resolvedChannelId) {
      return
    }

    markChannelRead(serverId, resolvedChannelId)
  }, [markChannelRead, resolvedChannelId, serverId])

  if (!serverId) {
    return <Navigate to="/app" replace />
  }

  if (workspaceQuery.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#202225] text-white">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-6 py-4 text-sm text-slate-300">
          Loading server workspace...
        </div>
      </main>
    )
  }

  if (!workspace) {
    return <Navigate to="/app" replace />
  }

  if (resolvedChannelId && resolvedChannelId !== channelId) {
    return <Navigate to={`/app/servers/${serverId}/channels/${resolvedChannelId}`} replace />
  }

  return (
    <main className="min-h-screen bg-[#202225] text-white">
      <div className="flex min-h-screen overflow-hidden pb-[104px] md:pb-0">
        <AppServerRail
          servers={servers}
          activeServerId={serverId}
          onCreateServerClick={() => setIsCreateServerOpen(true)}
          onSelectServer={(nextServerId) => {
            setActiveServerId(nextServerId)
            navigate(`/app/servers/${nextServerId}`, { replace: true })
          }}
        />

        <ServerChannelSidebar
          workspace={workspace}
          categorizedChannels={channelsByCategory.categorizedChannels}
          uncategorizedChannels={channelsByCategory.uncategorizedChannels}
          activeChannelId={resolvedChannelId}
          onSelectChannel={(nextChannelId) => {
            if (!serverId) {
              return
            }

            markChannelRead(serverId, nextChannelId)
            navigate(`/app/servers/${serverId}/channels/${nextChannelId}`, { replace: true })
          }}
          onServerSettingsClick={() => {
            navigate(`/app/servers/${serverId}/settings`, {
              state: { serverName: workspace.server.name },
            })
          }}
        />

        <div className="relative flex min-w-0 flex-1">
          <ServerChannelMain workspace={workspace} activeChannelId={resolvedChannelId} />
        </div>
      </div>

      <AppUserPanel variant="mobile" />
      <AppCreateServerModal open={isCreateServerOpen} onClose={() => setIsCreateServerOpen(false)} />
    </main>
  )
}

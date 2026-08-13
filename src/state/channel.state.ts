import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface ChannelReadState {
  readChannelIdsByServerId: Record<string, string[]>
  markChannelRead: (serverId: string, channelId: string) => void
  markChannelUnread: (serverId: string, channelId: string) => void
  isChannelUnread: (serverId: string, channelId: string) => boolean
}

function uniqueIds(channelIds: string[]) {
  return Array.from(new Set(channelIds))
}

export const useChannelReadStore = create<ChannelReadState>()(
  persist(
    (set, get) => ({
      readChannelIdsByServerId: {},

      markChannelRead: (serverId, channelId) =>
        set((state) => {
          const current = state.readChannelIdsByServerId[serverId] ?? []

          if (current.includes(channelId)) {
            return {}
          }

          return {
            readChannelIdsByServerId: {
              ...state.readChannelIdsByServerId,
              [serverId]: uniqueIds([...current, channelId]),
            },
          }
        }),

      markChannelUnread: (serverId, channelId) =>
        set((state) => ({
          readChannelIdsByServerId: {
            ...state.readChannelIdsByServerId,
            [serverId]: (state.readChannelIdsByServerId[serverId] ?? []).filter(
              (item) => item !== channelId,
            ),
          },
        })),

      isChannelUnread: (serverId, channelId) => {
        const readIds = get().readChannelIdsByServerId[serverId] ?? []
        return !readIds.includes(channelId)
      },
    }),
    {
      name: 'aether-channel-read-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        readChannelIdsByServerId: state.readChannelIdsByServerId,
      }),
    },
  ),
)

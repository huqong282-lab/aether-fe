import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ServerRecord } from "../lib/server/server.api";

export interface ServerRailState {
  activeServerId: string | null;
  extraServers: ServerRecord[];
  setActiveServerId: (serverId: string | null) => void;
  upsertServer: (server: ServerRecord) => void;
  replaceServers: (servers: ServerRecord[]) => void;
  removeServer: (serverId: string) => void;
}

export const useServerRailStore = create<ServerRailState>()(
  persist(
    (set) => ({
      activeServerId: null,
      extraServers: [],

      setActiveServerId: (serverId) =>
        set({
          activeServerId: serverId,
        }),

      upsertServer: (server) =>
        set((state) => {
          const exists = state.extraServers.some((item) => item.id === server.id);

          return {
            extraServers: exists
              ? state.extraServers.map((item) => (item.id === server.id ? server : item))
              : [server, ...state.extraServers],
          };
        }),

      replaceServers: (servers) =>
        set({
          extraServers: servers,
        }),

      removeServer: (serverId) =>
        set((state) => ({
          extraServers: state.extraServers.filter((server) => server.id !== serverId),
          activeServerId:
            state.activeServerId === serverId ? null : state.activeServerId,
        })),
    }),
    {
      name: "aether-server-rail",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeServerId: state.activeServerId,
        extraServers: state.extraServers,
      }),
    },
  ),
);

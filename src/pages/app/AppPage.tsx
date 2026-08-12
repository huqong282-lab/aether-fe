import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../state/auth.state";
import { useServerRailStore } from "../../state/server.state";
import { RealtimeConnectionProvider, useRealtimeConnection } from "../../lib/websocket";
import {
  getOwnedServersRequest,
  ownedServersQueryKey,
  type ServerRecord,
} from "../../lib/server/server.api";
import { AppCreateServerModal } from "./components/AppCreateServerModal";
import { AppMain } from "./components/AppMain";
import { AppServerRail } from "./components/AppServerRail";
import { AppSidebar } from "./components/AppSidebar";
import { AppUserPanel } from "./components/AppUserPanel";

function RealtimeStatusBadge() {
  const { isConnected, isConnecting, isReconnecting, reconnectAttempt, lastError } =
    useRealtimeConnection();

  const label = isConnected
    ? "Connected"
    : isReconnecting
      ? `Reconnecting ${reconnectAttempt}`
      : isConnecting
        ? "Connecting"
        : "Disconnected";

  const tone = isConnected
    ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25"
    : lastError
      ? "bg-rose-500/15 text-rose-200 border-rose-500/25"
      : "bg-slate-500/15 text-slate-200 border-slate-500/25";

  return (
    <div
      className={[
        "pointer-events-none fixed right-5 top-5 hidden rounded-full border px-4 py-2 text-sm shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur md:block",
        tone,
      ].join(" ")}
    >
      WS: {label}
    </div>
  );
}

function AppPageShell() {
  const user = useAuthStore((state) => state.user);
  const [isCreateServerOpen, setIsCreateServerOpen] = useState(false);
  const activeServerId = useServerRailStore((state) => state.activeServerId);
  const extraServers = useServerRailStore((state) => state.extraServers);
  const setActiveServerId = useServerRailStore((state) => state.setActiveServerId);

  const ownedServersQuery = useQuery({
    queryKey: ownedServersQueryKey,
    queryFn: getOwnedServersRequest,
    select: (response) => response.data,
    enabled: Boolean(user),
  });

  const mergedServers = [...(ownedServersQuery.data ?? []), ...extraServers].reduce<ServerRecord[]>(
    (accumulator, server) => {
      if (accumulator.some((item) => item.id === server.id)) {
        return accumulator;
      }

      return [...accumulator, server];
    },
    [],
  );

  return (
    <RealtimeConnectionProvider>
      <main className="min-h-screen bg-[#202225] text-white">
        <div className="flex min-h-screen overflow-hidden pb-[104px] md:pb-0">
          <AppServerRail
            servers={mergedServers}
            activeServerId={activeServerId}
            onCreateServerClick={() => setIsCreateServerOpen(true)}
            onSelectServer={setActiveServerId}
          />
          <AppSidebar />

          <div className="relative flex min-w-0 flex-1">
            <AppMain />
          </div>
        </div>

        <div className="pointer-events-none fixed left-5 top-5 hidden rounded-full border border-white/[0.08] bg-[#202225]/85 px-4 py-2 text-sm text-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur md:block">
          Login as <span className="font-semibold text-white">{user?.username ?? "guest"}</span>
        </div>

        <RealtimeStatusBadge />

        <AppCreateServerModal
          open={isCreateServerOpen}
          onClose={() => setIsCreateServerOpen(false)}
        />

        <AppUserPanel variant="mobile" />
      </main>
    </RealtimeConnectionProvider>
  );
}

export function AppPage() {
  return <AppPageShell />;
}

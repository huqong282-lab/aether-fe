import { createContext, useContext, type ReactNode } from "react";
import { useAuthStore } from "../../state/auth.state";
import { useWebSocket } from "./useWebSocket";
import type { UseWebSocketOptions, UseWebSocketResult } from "./websocket.types";

const RealtimeConnectionContext = createContext<UseWebSocketResult | null>(null);

export function RealtimeConnectionProvider({
  children,
  options,
}: {
  children: ReactNode;
  options?: Omit<UseWebSocketOptions, "accessToken" | "enabled">;
}) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const connection = useWebSocket({
    enabled: isAuthenticated,
    accessToken,
    ...options,
  });

  return (
    <RealtimeConnectionContext.Provider value={connection}>
      {children}
    </RealtimeConnectionContext.Provider>
  );
}

export function useRealtimeConnection() {
  const context = useContext(RealtimeConnectionContext);

  if (!context) {
    throw new Error("useRealtimeConnection must be used inside RealtimeConnectionProvider");
  }

  return context;
}


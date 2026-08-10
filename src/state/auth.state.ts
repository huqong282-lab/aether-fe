import { create } from "zustand";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatarUrl?: string | null;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;

  setAuth: (data: { user: UserProfile; accessToken: string; refreshToken?: string | null }) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

function extractSessionIdFromAccessToken(token: string): string | null {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoder = typeof globalThis.atob === "function"
      ? globalThis.atob
      : (value: string) => Buffer.from(value, "base64").toString("utf8");
    const payload = JSON.parse(decoder(padded)) as { sessionId?: unknown };

    return typeof payload.sessionId === "string" ? payload.sessionId : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  sessionId: null,
  user: null,
  isAuthenticated: false,

  setAuth: ({ user, accessToken, refreshToken = null }) =>
    set({
      user,
      accessToken,
      refreshToken,
      sessionId: extractSessionIdFromAccessToken(accessToken),
      isAuthenticated: true,
    }),

  setAccessToken: (token) =>
    set((state) => ({
      accessToken: token,
      isAuthenticated: !!token || !!state.user,
    })),

  setRefreshToken: (token) =>
    set({
      refreshToken: token,
    }),

  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: !!user || !!state.accessToken,
    })),

  logout: () =>
    set({
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      user: null,
      isAuthenticated: false,
    }),
}));

// Re-export as useAuthState for backwards compatibility
export const useAuthState = useAuthStore;

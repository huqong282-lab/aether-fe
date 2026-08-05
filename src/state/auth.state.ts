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
  user: UserProfile | null;
  isAuthenticated: boolean;

  setAuth: (data: { user: UserProfile; accessToken: string; refreshToken?: string | null }) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: ({ user, accessToken, refreshToken = null }) =>
    set({
      user,
      accessToken,
      refreshToken,
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
      user: null,
      isAuthenticated: false,
    }),
}));

// Re-export as useAuthState for backwards compatibility
export const useAuthState = useAuthStore;
import { create } from 'zustand'

export type VoiceConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

export type VoiceParticipantView = {
  sid: string
  identity: string
  displayName: string
  isLocal: boolean
  isMuted: boolean
  isSpeaking: boolean
}

export type VoiceSessionView = {
  serverId: string | null
  serverName: string | null
  channelId: string | null
  channelName: string | null
  roomName: string | null
  status: VoiceConnectionStatus
  isMuted: boolean
  error: string | null
  connectedAt: string | null
}

export interface VoiceState extends VoiceSessionView {
  participants: VoiceParticipantView[]
  setConnecting: (session: {
    serverId: string
    serverName: string | null
    channelId: string
    channelName: string
    roomName: string
  }) => void
  setConnected: (
    session: {
      serverId: string
      serverName: string | null
      channelId: string
      channelName: string
      roomName: string
      connectedAt?: string
    },
    participants: VoiceParticipantView[],
    isMuted: boolean,
  ) => void
  setParticipants: (participants: VoiceParticipantView[]) => void
  setMuted: (isMuted: boolean) => void
  setError: (message: string | null) => void
  clearVoiceState: () => void
}

const initialState = {
  serverId: null,
  serverName: null,
  channelId: null,
  channelName: null,
  roomName: null,
  status: 'idle' as VoiceConnectionStatus,
  isMuted: false,
  error: null,
  connectedAt: null,
  participants: [] as VoiceParticipantView[],
}

export const useVoiceStateStore = create<VoiceState>((set) => ({
  ...initialState,

  setConnecting: (session) =>
    set({
      serverId: session.serverId,
      serverName: session.serverName,
      channelId: session.channelId,
      channelName: session.channelName,
      roomName: session.roomName,
      status: 'connecting',
      isMuted: true,
      error: null,
      connectedAt: null,
      participants: [],
    }),

  setConnected: (session, participants, isMuted) =>
    set({
      serverId: session.serverId,
      serverName: session.serverName,
      channelId: session.channelId,
      channelName: session.channelName,
      roomName: session.roomName,
      status: 'connected',
      isMuted,
      error: null,
      connectedAt: session.connectedAt ?? new Date().toISOString(),
      participants,
    }),

  setParticipants: (participants) =>
    set((state) => ({
      ...state,
      participants,
    })),

  setMuted: (isMuted) =>
    set((state) => ({
      ...state,
      isMuted,
    })),

  setError: (message) =>
    set((state) => ({
      ...state,
      status: message ? 'error' : state.status,
      error: message,
    })),

  clearVoiceState: () =>
    set({
      ...initialState,
    }),
}))


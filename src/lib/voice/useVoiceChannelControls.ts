import { useCallback, useEffect, useMemo, useRef } from 'react'
import { RoomEvent } from 'livekit-client'
import { useAuthStore } from '../../state/auth.state'
import { useVoiceStateStore, type VoiceParticipantView } from '../../state/voice.state'
import type { ServerChannelRecord } from '../server/server-workspace.api'
import { useVoiceToken } from './useVoiceToken'

function buildParticipantList(
  room: NonNullable<ReturnType<typeof useVoiceToken>['room']>,
  localDisplayName: string,
): VoiceParticipantView[] {
  const localParticipant = room.localParticipant
  const remoteParticipants = Array.from(room.remoteParticipants.values())

  return [
    {
      sid: localParticipant.sid,
      identity: localParticipant.identity,
      displayName: localDisplayName || localParticipant.name || localParticipant.identity || 'You',
      isLocal: true,
      isMuted: !localParticipant.isMicrophoneEnabled,
      isSpeaking: localParticipant.isSpeaking,
    },
    ...remoteParticipants.map((participant) => ({
      sid: participant.sid,
      identity: participant.identity,
      displayName: participant.name || participant.identity || 'Unknown participant',
      isLocal: false,
      isMuted: !participant.isMicrophoneEnabled,
      isSpeaking: participant.isSpeaking,
    })),
  ].sort((left, right) => {
    if (left.isLocal !== right.isLocal) {
      return left.isLocal ? -1 : 1
    }

    return left.displayName.localeCompare(right.displayName, 'id-ID')
  })
}

export function useVoiceChannelControls() {
  const currentUser = useAuthStore((state) => state.user)
  const { room, join, leave, loading, error: tokenError, clearError: clearTokenError } = useVoiceToken()
  const voiceState = useVoiceStateStore()
  const cleanupRef = useRef<(() => void) | null>(null)

  const syncRoomState = useCallback(
    (currentRoom: NonNullable<typeof room>) => {
      const currentState = useVoiceStateStore.getState()
      if (!currentState.channelId) {
        return
      }

      const localDisplayName = currentUser?.name ?? currentUser?.username ?? currentUser?.email ?? 'You'
      const participants = buildParticipantList(currentRoom, localDisplayName)

      currentState.setConnected(
        {
          serverId: currentState.serverId ?? 'unknown-server',
          serverName: currentState.serverName,
          channelId: currentState.channelId,
          channelName: currentState.channelName ?? 'Voice Channel',
          roomName: currentState.roomName ?? 'voice-room',
          connectedAt: currentState.connectedAt ?? new Date().toISOString(),
        },
        participants,
        !currentRoom.localParticipant.isMicrophoneEnabled,
      )
    },
    [currentUser?.email, currentUser?.name, currentUser?.username],
  )

  useEffect(() => {
    cleanupRef.current?.()
    cleanupRef.current = null

    if (!room) {
      return
    }

    const handleUpdate = () => {
      syncRoomState(room)
    }

    const handleDisconnected = () => {
      const currentState = useVoiceStateStore.getState()
      if (currentState.roomName) {
        currentState.clearVoiceState()
      }
    }

    room.on(RoomEvent.Connected, handleUpdate)
    room.on(RoomEvent.Reconnected, handleUpdate)
    room.on(RoomEvent.ParticipantConnected, handleUpdate)
    room.on(RoomEvent.ParticipantDisconnected, handleUpdate)
    room.on(RoomEvent.TrackMuted, handleUpdate)
    room.on(RoomEvent.TrackUnmuted, handleUpdate)
    room.on(RoomEvent.ParticipantNameChanged, handleUpdate)
    room.on(RoomEvent.ParticipantAttributesChanged, handleUpdate)
    room.on(RoomEvent.ConnectionStateChanged, handleUpdate)
    room.on(RoomEvent.Disconnected, handleDisconnected)

    handleUpdate()

    cleanupRef.current = () => {
      room.off(RoomEvent.Connected, handleUpdate)
      room.off(RoomEvent.Reconnected, handleUpdate)
      room.off(RoomEvent.ParticipantConnected, handleUpdate)
      room.off(RoomEvent.ParticipantDisconnected, handleUpdate)
      room.off(RoomEvent.TrackMuted, handleUpdate)
      room.off(RoomEvent.TrackUnmuted, handleUpdate)
      room.off(RoomEvent.ParticipantNameChanged, handleUpdate)
      room.off(RoomEvent.ParticipantAttributesChanged, handleUpdate)
      room.off(RoomEvent.ConnectionStateChanged, handleUpdate)
      room.off(RoomEvent.Disconnected, handleDisconnected)
    }

    return cleanupRef.current
  }, [room, syncRoomState])

  useEffect(() => {
    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
      useVoiceStateStore.getState().clearVoiceState()
    }
  }, [])

  const joinChannel = useCallback(
    async (channel: ServerChannelRecord, serverName: string) => {
      if (voiceState.channelId === channel.id && room) {
        return room
      }

      const session = {
        serverId: channel.serverId,
        serverName,
        channelId: channel.id,
        channelName: channel.name,
        roomName: channel.name,
      }

      useVoiceStateStore.getState().setConnecting(session)

      try {
        const joinedRoom = await join(channel.id)
        if (!joinedRoom) {
          return null
        }

        const localDisplayName = currentUser?.name ?? currentUser?.username ?? currentUser?.email ?? 'You'
        const participants = buildParticipantList(joinedRoom, localDisplayName)

        useVoiceStateStore.getState().setConnected(
          {
            ...session,
            connectedAt: new Date().toISOString(),
          },
          participants,
          !joinedRoom.localParticipant.isMicrophoneEnabled,
        )

        return joinedRoom
      } catch (error) {
        const message = error instanceof Error && error.message ? error.message : 'Gagal bergabung ke voice channel.'
        useVoiceStateStore.getState().setError(message)
        throw error
      }
    },
    [currentUser?.email, currentUser?.name, currentUser?.username, join, room, voiceState.channelId],
  )

  const leaveChannel = useCallback(async () => {
    try {
      await leave()
      useVoiceStateStore.getState().clearVoiceState()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal keluar dari voice channel.'
      useVoiceStateStore.getState().setError(message)
      throw error
    }
  }, [leave])

  const toggleMute = useCallback(async () => {
    const currentRoom = room
    if (!currentRoom) {
      const message = 'Tidak ada voice channel aktif.'
      useVoiceStateStore.getState().setError(message)
      throw new Error(message)
    }

    try {
      await currentRoom.localParticipant.setMicrophoneEnabled(!currentRoom.localParticipant.isMicrophoneEnabled)
      syncRoomState(currentRoom)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal mengubah status mikrofon.'
      useVoiceStateStore.getState().setError(message)
      throw error
    }
  }, [room, syncRoomState])

  const clearError = useCallback(() => {
    useVoiceStateStore.getState().setError(null)
    clearTokenError()
  }, [clearTokenError])

  return useMemo(
    () => ({
      joinChannel,
      leaveChannel,
      toggleMute,
      clearError,
      room,
      loading,
      error: tokenError ?? voiceState.error,
      session: {
        serverId: voiceState.serverId,
        serverName: voiceState.serverName,
        channelId: voiceState.channelId,
        channelName: voiceState.channelName,
        roomName: voiceState.roomName,
        status: voiceState.status,
        isMuted: voiceState.isMuted,
        connectedAt: voiceState.connectedAt,
      },
      participants: voiceState.participants,
    }),
    [
      clearError,
      joinChannel,
      leaveChannel,
      loading,
      room,
      tokenError,
      toggleMute,
      voiceState.channelId,
      voiceState.channelName,
      voiceState.connectedAt,
      voiceState.error,
      voiceState.isMuted,
      voiceState.participants,
      voiceState.roomName,
      voiceState.serverId,
      voiceState.serverName,
      voiceState.status,
    ],
  )
}

export type UseVoiceChannelControlsResult = ReturnType<typeof useVoiceChannelControls>

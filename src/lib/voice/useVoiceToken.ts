import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Room } from 'livekit-client'
import { normalizeVoiceTokenError, requestVoiceToken, resolveLiveKitUrl } from './voice.api'

export type JoinVoiceOptions = {
  withVideo?: boolean
}

async function safelyDisconnectRoom(room: Room | null) {
  if (!room) {
    return
  }

  try {
    await room.disconnect()
  } catch {
    // Ignore disconnect errors so they do not mask the original join failure.
  }
}

export function useVoiceToken() {
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roomRef = useRef<Room | null>(null)
  const joinRequestIdRef = useRef(0)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const leave = useCallback(async () => {
    joinRequestIdRef.current += 1

    const currentRoom = roomRef.current
    roomRef.current = null
    setRoom(null)
    setLoading(false)
    setError(null)

    await safelyDisconnectRoom(currentRoom)
  }, [])

  const join = useCallback(
    async (channelId: string, options: JoinVoiceOptions = {}) => {
      const normalizedChannelId = channelId.trim()
      if (!normalizedChannelId) {
        const message = 'Channel ID diperlukan untuk bergabung ke voice channel.'
        setError(message)
        throw new Error(message)
      }

      const requestId = ++joinRequestIdRef.current
      const withVideo = options.withVideo ?? false

      setLoading(true)
      setError(null)

      try {
        const response = await requestVoiceToken(normalizedChannelId, { withVideo })
        const livekitUrl = resolveLiveKitUrl(response.data)

        if (!livekitUrl) {
          throw new Error('Backend tidak mengembalikan livekitUrl atau serverUrl.')
        }

        if (requestId !== joinRequestIdRef.current) {
          return roomRef.current
        }

        const nextRoom = new Room()

        try {
          await nextRoom.connect(livekitUrl, response.data.token)
        } catch (connectError) {
          await safelyDisconnectRoom(nextRoom)
          throw connectError
        }

        if (requestId !== joinRequestIdRef.current) {
          await safelyDisconnectRoom(nextRoom)
          return roomRef.current
        }

        const previousRoom = roomRef.current
        roomRef.current = nextRoom
        setRoom(nextRoom)

        if (previousRoom && previousRoom !== nextRoom) {
          await safelyDisconnectRoom(previousRoom)
        }

        return nextRoom
      } catch (joinError) {
        if (requestId === joinRequestIdRef.current) {
          setError(normalizeVoiceTokenError(joinError))
        }

        throw joinError
      } finally {
        if (requestId === joinRequestIdRef.current) {
          setLoading(false)
        }
      }
    },
    [],
  )

  useEffect(() => {
    return () => {
      joinRequestIdRef.current += 1
      void safelyDisconnectRoom(roomRef.current)
      roomRef.current = null
    }
  }, [])

  return useMemo(
    () => ({
      loading,
      error,
      room,
      join,
      leave,
      clearError,
    }),
    [clearError, error, join, leave, loading, room],
  )
}

export type UseVoiceTokenResult = ReturnType<typeof useVoiceToken>

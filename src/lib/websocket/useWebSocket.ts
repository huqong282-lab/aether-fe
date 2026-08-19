import { useEffect, useMemo, useRef, useState } from "react";
import type {
  RealtimeEnvelope,
  RealtimeMessageHandler,
  RealtimeSubscription,
  UseWebSocketOptions,
  UseWebSocketResult,
  WebSocketConnectionStatus,
} from "./websocket.types";
import {
  buildWebSocketUrl,
  createReconnectDelay,
  DEFAULT_WS_URL,
  parseRealtimeEnvelope,
  shouldReconnectOnClose,
} from "./websocket.utils";

const DEFAULT_AUTH_MESSAGE_TYPE = "auth";

function getConnectionStatus(readyState: number | undefined): WebSocketConnectionStatus {
  switch (readyState) {
    case WebSocket.CONNECTING:
      return "connecting";
    case WebSocket.OPEN:
      return "connected";
    case WebSocket.CLOSING:
      return "disconnected";
    case WebSocket.CLOSED:
      return "disconnected";
    default:
      return "idle";
  }
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketResult {
  const {
    enabled = true,
    url = DEFAULT_WS_URL,
    accessToken = null,
    autoConnect = true,
    reconnect = true,
    maxReconnectAttempts = 8,
    initialReconnectDelayMs = 500,
    maxReconnectDelayMs = 15_000,
    jitterRatio = 0.2,
    sendAuthOnOpen = true,
    authMessageType = DEFAULT_AUTH_MESSAGE_TYPE,
    createAuthPayload,
  } = options;

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketConnectionStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null);
  const [latestMessage, setLatestMessage] = useState<RealtimeEnvelope | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const manualDisconnectRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  const latestOptionsRef = useRef<UseWebSocketOptions>(options);
  const eventHandlersRef = useRef(
    new Map<string, Set<RealtimeMessageHandler>>(),
  );

  useEffect(() => {
    latestOptionsRef.current = options;
  }, [options]);

  const clearReconnectTimer = () => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const teardownSocket = (nextSocket: WebSocket | null, skipReconnect = false) => {
    if (socketRef.current && socketRef.current !== nextSocket) {
      socketRef.current.onopen = null;
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      socketRef.current.onmessage = null;

      if (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      ) {
        manualDisconnectRef.current = skipReconnect;
        socketRef.current.close(1000, "Client disconnected");
      }
    }

    socketRef.current = nextSocket;
    setSocket(nextSocket);
  };

  const dispatchMessage = (message: RealtimeEnvelope, rawEvent: MessageEvent<string>) => {
    setLatestMessage(message);
    setLastMessageAt(new Date().toISOString());

    latestOptionsRef.current.onMessage?.(message, rawEvent);

    eventHandlersRef.current.get(message.type)?.forEach((handler) => {
      handler(message, rawEvent);
    });

    eventHandlersRef.current.get("*")?.forEach((handler) => {
      handler(message, rawEvent);
    });
  };

  const disconnect = () => {
    clearReconnectTimer();
    manualDisconnectRef.current = true;
    reconnectAttemptRef.current = 0;
    setReconnectAttempt(0);

    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      socketRef.current.onmessage = null;

      if (
        socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING
      ) {
        socketRef.current.close(1000, "Client disconnected");
      }
    }

    socketRef.current = null;
    setSocket(null);
    setStatus("disconnected");
  };

  const scheduleReconnect = () => {
    if (!reconnect || manualDisconnectRef.current || !enabled) {
      setStatus("disconnected");
      return;
    }

    if (reconnectAttemptRef.current >= maxReconnectAttempts) {
      setStatus("error");
      setLastError("Reconnect limit reached");
      return;
    }

    clearReconnectTimer();

    const attempt = reconnectAttemptRef.current + 1;
    reconnectAttemptRef.current = attempt;
    setReconnectAttempt(attempt);
    setStatus("reconnecting");

    const delay = createReconnectDelay(
      attempt - 1,
      initialReconnectDelayMs,
      maxReconnectDelayMs,
      jitterRatio,
    );

    reconnectTimerRef.current = window.setTimeout(() => {
      connect();
    }, delay);
  };

  const connect = () => {
    if (!enabled || !autoConnect) {
      return;
    }

    const existingSocket = socketRef.current;
    if (
      existingSocket &&
      (existingSocket.readyState === WebSocket.OPEN ||
        existingSocket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    clearReconnectTimer();
    manualDisconnectRef.current = false;
    setStatus("connecting");
    setLastError(null);

    const socketUrl = buildWebSocketUrl(url);
    const socketWithTokenUrl =
      accessToken && socketUrl
        ? (() => {
            const nextUrl = new URL(socketUrl);
            nextUrl.searchParams.set("token", accessToken);
            return nextUrl.toString();
          })()
        : socketUrl;

    const nextSocket = new WebSocket(socketWithTokenUrl);

    teardownSocket(nextSocket);

    nextSocket.onopen = async () => {
      if (socketRef.current !== nextSocket) {
        return;
      }

      setStatus("connected");
      setConnectedAt(new Date().toISOString());
      reconnectAttemptRef.current = 0;
      setReconnectAttempt(0);
      latestOptionsRef.current.onOpen?.(nextSocket);

      if (sendAuthOnOpen && accessToken) {
        const authPayload =
          createAuthPayload?.(accessToken) ?? {
            type: authMessageType,
            payload: {
              token: accessToken,
            },
          };

        if (nextSocket.readyState === WebSocket.OPEN) {
          nextSocket.send(JSON.stringify(authPayload));
        }
      }

      try {
        await Promise.resolve(latestOptionsRef.current.onResync?.());
      } catch (error) {
        const message = error instanceof Error ? error.message : "Resync failed";
        setLastError(message);
      }
    };

    nextSocket.onmessage = (event) => {
      const message = parseRealtimeEnvelope(event.data);
      dispatchMessage(message, event);
    };

    nextSocket.onerror = (event) => {
      latestOptionsRef.current.onError?.(event);
      setLastError("WebSocket error");
      setStatus(getConnectionStatus(nextSocket.readyState));
    };

    nextSocket.onclose = (event) => {
      if (socketRef.current === nextSocket) {
        socketRef.current = null;
        setSocket(null);
      }

      latestOptionsRef.current.onClose?.(event);
      setStatus("disconnected");

      if (manualDisconnectRef.current) {
        manualDisconnectRef.current = false;
        return;
      }

      if (!shouldReconnectOnClose(event.code)) {
        setStatus("error");
        setLastError(event.reason || "Connection closed");
        return;
      }

      scheduleReconnect();
    };
  };

  const send = (payload: string | RealtimeEnvelope | Record<string, unknown>) => {
    const activeSocket = socketRef.current;
    if (!activeSocket || activeSocket.readyState !== WebSocket.OPEN) {
      return false;
    }

    const data = typeof payload === "string" ? payload : JSON.stringify(payload);
    activeSocket.send(data);
    return true;
  };

  const sendEvent = (type: string, payload?: unknown, meta?: Record<string, unknown>) => {
    return send({
      event: type,
      data: payload,
      ...(meta ?? {}),
    });
  };

  const subscribe = <TPayload = unknown,>(
    type: string | "*",
    handler: RealtimeMessageHandler<TPayload>,
  ): RealtimeSubscription => {
    const handlers = eventHandlersRef.current.get(type) ?? new Set<RealtimeMessageHandler>();
    handlers.add(handler as RealtimeMessageHandler);
    eventHandlersRef.current.set(type, handlers);

    return {
      unsubscribe: () => {
        const currentHandlers = eventHandlersRef.current.get(type);
        if (!currentHandlers) {
          return;
        }

        currentHandlers.delete(handler as RealtimeMessageHandler);
        if (currentHandlers.size === 0) {
          eventHandlersRef.current.delete(type);
        }
      },
    };
  };

  const resync = async () => {
    await Promise.resolve(latestOptionsRef.current.onResync?.());
  };

  useEffect(() => {
    if (!autoConnect || !enabled) {
      disconnect();
      return undefined;
    }

    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, enabled, url, accessToken]);

  const result = useMemo<UseWebSocketResult>(
    () => ({
      socket,
      status,
      isConnected: status === "connected",
      isConnecting: status === "connecting",
      isReconnecting: status === "reconnecting",
      lastError,
      reconnectAttempt,
      connectedAt,
      lastMessageAt,
      latestMessage,
      send,
      sendEvent,
      connect,
      disconnect,
      resync,
      subscribe,
    }),
    [
      connectedAt,
      disconnect,
      lastError,
      lastMessageAt,
      latestMessage,
      reconnectAttempt,
      resync,
      socket,
      status,
    ],
  );

  return result;
}

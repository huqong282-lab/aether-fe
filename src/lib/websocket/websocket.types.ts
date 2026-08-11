export type WebSocketConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

export interface RealtimeEnvelope<TPayload = unknown> {
  type: string;
  payload?: TPayload;
  event?: string;
  channelId?: string;
  requestId?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface RealtimeSubscription {
  unsubscribe: () => void;
}

export type RealtimeMessageHandler<TPayload = unknown> = (
  message: RealtimeEnvelope<TPayload>,
  event: MessageEvent<string>,
) => void;

export interface UseWebSocketOptions {
  enabled?: boolean;
  url?: string;
  accessToken?: string | null;
  autoConnect?: boolean;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  initialReconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  jitterRatio?: number;
  sendAuthOnOpen?: boolean;
  authMessageType?: string;
  createAuthPayload?: (accessToken: string) => RealtimeEnvelope;
  onOpen?: (socket: WebSocket) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: RealtimeEnvelope, event: MessageEvent<string>) => void;
  onResync?: () => void | Promise<void>;
}

export interface UseWebSocketResult {
  socket: WebSocket | null;
  status: WebSocketConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  lastError: string | null;
  reconnectAttempt: number;
  connectedAt: string | null;
  lastMessageAt: string | null;
  latestMessage: RealtimeEnvelope | null;
  send: (payload: string | RealtimeEnvelope | Record<string, unknown>) => boolean;
  sendEvent: (type: string, payload?: unknown, meta?: Record<string, unknown>) => boolean;
  connect: () => void;
  disconnect: () => void;
  resync: () => Promise<void>;
  subscribe: <TPayload = unknown>(
    type: string | "*",
    handler: RealtimeMessageHandler<TPayload>,
  ) => RealtimeSubscription;
}


import type { RealtimeEnvelope } from "./websocket.types";

const FALLBACK_WS_URL = "ws://ws.localhost";

function resolveFallbackWebSocketUrl() {
  if (typeof window === "undefined") {
    return FALLBACK_WS_URL;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//ws.localhost`;
}

export const DEFAULT_WS_URL =
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_WEB_SOCKET_URL ||
  resolveFallbackWebSocketUrl();

const AUTH_FAILURE_CLOSE_CODES = new Set([1000, 1008, 4001, 4401, 4403]);

export function buildWebSocketUrl(baseUrl: string): string {
  if (!baseUrl) {
    return DEFAULT_WS_URL;
  }

  if (/^https?:\/\//i.test(baseUrl)) {
    return baseUrl.replace(/^http/i, "ws");
  }

  return baseUrl;
}

export function createReconnectDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  jitterRatio: number,
): number {
  const rawDelay = Math.min(initialDelayMs * 2 ** attempt, maxDelayMs);
  const jitterWindow = rawDelay * jitterRatio;
  const jitter = jitterWindow > 0 ? (Math.random() * jitterWindow * 2 - jitterWindow) : 0;
  return Math.max(0, Math.round(rawDelay + jitter));
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseRealtimeEnvelope(rawData: unknown): RealtimeEnvelope {
  if (typeof rawData !== "string") {
    return {
      type: "message",
      payload: rawData,
    };
  }

  try {
    const parsed = JSON.parse(rawData);
    if (isPlainObject(parsed)) {
      const type = typeof parsed.type === "string" && parsed.type.length > 0 ? parsed.type : "message";
      return {
        type,
        ...parsed,
      } as RealtimeEnvelope;
    }
  } catch {
    // Fall through to plain string payload.
  }

  return {
    type: "message",
    payload: rawData,
  };
}

export function shouldReconnectOnClose(code: number): boolean {
  return !AUTH_FAILURE_CLOSE_CODES.has(code);
}

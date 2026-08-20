import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { BellIcon, MessageIcon } from "../../pages/app/app-icons";
import { useAuthStore } from "../../state/auth.state";
import { useUiStore } from "../../state/ui.state";
import { useRealtimeConnection } from "../../lib/websocket";
import type { RealtimeEnvelope } from "../../lib/websocket";
import {
  getNotificationsRequest,
  markNotificationAsReadRequest,
  notificationQueryKeys,
  type NotificationPayloadRecord,
  type NotificationRecord,
} from "../../lib/notification/notification.api";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNotificationEnvelopePayload(message: RealtimeEnvelope): Record<string, unknown> | null {
  if (isRecord(message.payload)) {
    return message.payload;
  }

  if (isRecord((message as Record<string, unknown>).data)) {
    return message.data as Record<string, unknown>;
  }

  return null;
}

function extractNotificationRecord(message: RealtimeEnvelope): NotificationRecord | null {
  const payload = getNotificationEnvelopePayload(message);

  if (!payload) {
    return null;
  }

  const source = isRecord(payload.notification)
    ? payload.notification
    : isRecord(payload.data)
      ? payload.data
      : payload;

  const id = typeof source.id === "string" ? source.id : null;
  const userId = typeof source.userId === "string" ? source.userId : null;
  const type = typeof source.type === "string" ? source.type : null;
  const createdAt = typeof source.createdAt === "string" ? source.createdAt : null;
  const isRead = typeof source.isRead === "boolean" ? source.isRead : false;

  if (!id || !userId || !type || !createdAt) {
    return null;
  }

  const rawPayload = isRecord(source.payload) ? source.payload : source;

  return {
    id,
    userId,
    type,
    createdAt,
    isRead,
    payload: rawPayload as NotificationPayloadRecord,
  };
}

function formatRelativeTime(isoDate: string) {
  const diffMs = Date.now() - Date.parse(isoDate);

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return "Baru saja";
  }

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) {
    return "Baru saja";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}j`;
  }

  const days = Math.floor(hours / 24);
  return `${days}h`;
}

function getNotificationTitle(notification: NotificationRecord) {
  if (notification.type === "mention") {
    return "Mention baru";
  }

  return "Notifikasi baru";
}

function getNotificationDescription(notification: NotificationRecord) {
  const payload = notification.payload;

  if (notification.type === "mention") {
    const channelId = typeof payload.channelId === "string" ? payload.channelId : null;
    const serverId = typeof payload.serverId === "string" ? payload.serverId : null;

    if (serverId && channelId) {
      return `Ada mention baru di channel ${channelId}`;
    }

    return "Ada mention baru untukmu";
  }

  return "Buka panel untuk melihat detailnya";
}

function getNotificationTarget(notification: NotificationRecord) {
  const payload = notification.payload;
  const messageId = typeof payload.messageId === "string" ? payload.messageId : null;
  const channelId = typeof payload.channelId === "string" ? payload.channelId : null;
  const serverId = typeof payload.serverId === "string" ? payload.serverId : null;

  if (!messageId || !channelId || !serverId) {
    return null;
  }

  return {
    messageId,
    channelId,
    serverId,
  };
}

const NotificationBellButton = forwardRef<
  HTMLButtonElement,
  {
    unreadCount: number;
    isOpen: boolean;
    onClick: () => void;
  }
>(function NotificationBellButton({ unreadCount, isOpen, onClick }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={[
        "relative flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#2b2d31]/95 text-slate-100 shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition hover:bg-[#34363b]",
        isOpen ? "ring-2 ring-[#5865F2]/70" : "",
      ].join(" ")}
      aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`}
      aria-expanded={isOpen}
    >
      <BellIcon className="h-5 w-5" />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-[#2b2d31] bg-[#ED4245] px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
});

function ToastViewport() {
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);

  return (
    <div className="pointer-events-none fixed right-5 top-20 z-50 flex w-[min(92vw,360px)] flex-col gap-3">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} id={toast.id} type={toast.type} message={toast.message} duration={toast.duration ?? 4000} onDismiss={removeToast} />
      ))}
    </div>
  );
}

function ToastCard({
  id,
  type,
  message,
  duration,
  onDismiss,
}: {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration: number;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [duration, id, onDismiss]);

  const toneClass = {
    success: "border-emerald-500/25 bg-emerald-500/15 text-emerald-50",
    error: "border-rose-500/25 bg-rose-500/15 text-rose-50",
    info: "border-sky-500/25 bg-sky-500/15 text-sky-50",
    warning: "border-amber-500/25 bg-amber-500/15 text-amber-50",
  }[type];

  return (
    <div className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.3)] backdrop-blur ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Notifikasi realtime</p>
          <p className="mt-1 text-sm leading-5 text-current/90">{message}</p>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="rounded-full border border-current/20 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-current/80 transition hover:bg-white/10"
          aria-label="Tutup toast"
        >
          x
        </button>
      </div>
    </div>
  );
}

function NotificationPanel({
  notifications,
  unreadCount,
  isLoading,
  onClose,
  onRead,
}: {
  notifications: NotificationRecord[];
  unreadCount: number;
  isLoading: boolean;
  onClose: () => void;
  onRead: (notification: NotificationRecord) => void;
}) {
  return (
    <div className="absolute right-0 top-14 z-40 w-[min(92vw,420px)] overflow-hidden rounded-[28px] border border-white/10 bg-[#2b2d31]/96 shadow-[0_28px_70px_rgba(0,0,0,0.46)] backdrop-blur">
      <div className="flex items-start justify-between border-b border-white/[0.08] px-5 py-4">
        <div>
          <p className="text-lg font-semibold text-white">Notifications</p>
          <p className="mt-1 text-xs text-slate-400">{unreadCount} belum dibaca</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/10"
        >
          Close
        </button>
      </div>

      <div className="max-h-[64vh] overflow-y-auto">
        {isLoading ? (
          <div className="px-5 py-8 text-sm text-slate-400">Memuat notifikasi...</div>
        ) : notifications.length === 0 ? (
          <div className="px-5 py-8 text-sm text-slate-400">Belum ada notifikasi.</div>
        ) : (
          <div className="space-y-1 p-2">
            {notifications.map((notification) => {
              const isUnread = !notification.isRead;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => onRead(notification)}
                  className={[
                    "flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition",
                    isUnread ? "bg-white/[0.06] hover:bg-white/[0.09]" : "bg-transparent hover:bg-white/[0.05]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      isUnread ? "bg-[#5865F2]/20 text-[#d9ddff]" : "bg-white/5 text-slate-300",
                    ].join(" ")}
                  >
                    <MessageIcon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-white">{getNotificationTitle(notification)}</p>
                      <span className="shrink-0 text-[11px] text-slate-500">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-300">
                      {getNotificationDescription(notification)}
                    </p>
                  </div>

                  {isUnread ? <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#5865F2]" /> : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const user = useAuthStore((state) => state.user);
  const realtime = useRealtimeConnection();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useUiStore((state) => state.addToast);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const notificationsQuery = useQuery({
    queryKey: notificationQueryKeys.list(user?.id),
    queryFn: getNotificationsRequest,
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });

  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  const markAsReadMutation = useMutation({
    mutationFn: async (notification: NotificationRecord) => {
      if (notification.isRead) {
        return { data: notification };
      }

      return markNotificationAsReadRequest(notification.id);
    },
    onMutate: async (notification) => {
      await queryClient.cancelQueries({ queryKey: notificationQueryKeys.list(user?.id) });

      const previous = queryClient.getQueryData<{ data: NotificationRecord[] }>(
        notificationQueryKeys.list(user?.id),
      );

      queryClient.setQueryData<{ data: NotificationRecord[] }>(notificationQueryKeys.list(user?.id), (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          data: current.data.map((item) =>
            item.id === notification.id ? { ...item, isRead: true } : item,
          ),
        };
      });

      return { previous };
    },
    onError: (_error, _notification, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationQueryKeys.list(user?.id), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list(user?.id) });
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!realtime.isConnected) {
      return undefined;
    }

    const subscription = realtime.subscribe("notification.created", (message) => {
      const notification = extractNotificationRecord(message);

      if (!notification || (user?.id && notification.userId !== user.id)) {
        return;
      }

      queryClient.setQueryData<{ data: NotificationRecord[] }>(
        notificationQueryKeys.list(user?.id),
        (current) => {
          const existing = current?.data ?? [];
          const next = [
            notification,
            ...existing.filter((item) => item.id !== notification.id),
          ].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

          return {
            data: next,
          };
        },
      );

      addToast({
        type: "info",
        message: getNotificationDescription(notification),
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [addToast, queryClient, realtime, user?.id]);

  const handleOpenChange = () => {
    setIsOpen((current) => !current);
  };

  const handleRead = (notification: NotificationRecord) => {
    const target = getNotificationTarget(notification);

    void markAsReadMutation.mutateAsync(notification);

    setIsOpen(false);

    if (!target) {
      return;
    }

    navigate(
      `/app/servers/${target.serverId}/channels/${target.channelId}?messageId=${target.messageId}`,
    );
  };

  return (
    <>
      <div className="pointer-events-none fixed right-3 top-3 z-40 md:right-5 md:top-5">
        <div className="pointer-events-auto relative">
          <NotificationBellButton
            ref={buttonRef}
            unreadCount={unreadCount}
            isOpen={isOpen}
            onClick={handleOpenChange}
          />

          {isOpen ? (
            <div ref={panelRef}>
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                isLoading={notificationsQuery.isLoading}
                onClose={() => setIsOpen(false)}
                onRead={handleRead}
              />
            </div>
          ) : null}
        </div>
      </div>

      <ToastViewport />
    </>
  );
}

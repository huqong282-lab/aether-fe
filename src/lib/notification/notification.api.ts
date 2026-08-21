import { apiClient } from "../api";

export type NotificationPayloadRecord = Record<string, unknown> & {
  messageId?: string;
  channelId?: string;
  serverId?: string;
  authorId?: string;
};

export type NotificationRecord = {
  id: string;
  userId: string;
  type: string;
  payload: NotificationPayloadRecord;
  isRead: boolean;
  createdAt: string;
};

export type NotificationListResponse = {
  data: NotificationRecord[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (userId: string | null | undefined) => [...notificationQueryKeys.all, userId ?? "guest"] as const,
};

const PAGE_SIZE = 100;

export async function getNotificationsRequest() {
  const notifications: NotificationRecord[] = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const response = await apiClient.get("/notifications", {
      params: {
        offset,
        limit: PAGE_SIZE,
      },
    });

    const payload = response.data as NotificationListResponse;
    const currentPage = Array.isArray(payload.data) ? payload.data : [];

    notifications.push(...currentPage);

    const nextTotal = payload.meta?.total;
    total = typeof nextTotal === "number" ? nextTotal : notifications.length;

    if (currentPage.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return {
    data: notifications,
    meta: {
      total: notifications.length,
    },
  };
}

export async function markNotificationAsReadRequest(notificationId: string) {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`);
  return response.data as { data: NotificationRecord };
}

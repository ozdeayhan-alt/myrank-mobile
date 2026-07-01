import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { AppNotification } from "../types";
import { mapApiNotification } from "./mapApiNotification";

const DEFAULT_NOTIFICATION_LIMIT = 10;

type NotificationsApiResponse = {
  ok: boolean;
  notifications: Array<{
    id: string;
    type: AppNotification["type"];
    actorId: string;
    actorDisplayName: string;
    payload: AppNotification["payload"];
    createdAt: string | null;
  }>;
  error?: string;
};

export async function fetchNotifications(
  _userId: string,
  options?: { limit?: number }
): Promise<AppNotification[]> {
  const pageLimit = options?.limit ?? DEFAULT_NOTIFICATION_LIMIT;
  const params = new URLSearchParams({ limit: String(pageLimit) });

  const response = await fetchApi(
    `${getApiBaseUrl()}/api/notifications?${params.toString()}`,
    { method: "GET", timeoutMs: 15_000 }
  );

  const data = (await response.json()) as NotificationsApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Notifications request failed");
  }

  return (data.notifications ?? [])
    .map((item) =>
      mapApiNotification({
        id: item.id,
        type: item.type,
        actorId: item.actorId,
        actorDisplayName: item.actorDisplayName,
        payload: item.payload,
        createdAt: item.createdAt,
      })
    )
    .filter((item): item is AppNotification => item != null);
}

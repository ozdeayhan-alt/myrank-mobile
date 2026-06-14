import type { AppNotification, NotificationPayload } from "@/features/notifications/types";

function parsePayload(raw: unknown): NotificationPayload {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as NotificationPayload;
    } catch {
      return {};
    }
  }

  if (raw && typeof raw === "object") {
    return raw as NotificationPayload;
  }

  return {};
}

export function notificationFromPushData(
  data: Record<string, unknown>
): AppNotification | null {
  const type = data.type;
  if (typeof type !== "string" || !type.trim()) {
    return null;
  }

  return {
    id: typeof data.notificationId === "string" ? data.notificationId : "",
    type: type as AppNotification["type"],
    actorId: String(data.actorId ?? ""),
    actorDisplayName: String(data.actorDisplayName ?? ""),
    payload: parsePayload(data.payload),
    createdAt: null,
  };
}

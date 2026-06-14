import type { AppNotification } from "../types";
import { normalizeDate } from "@/lib/normalizeDate";

export function countUnreadNotifications(
  notifications: AppNotification[],
  lastReadAt: Date | null
): number {
  const readAt = normalizeDate(lastReadAt);

  if (!readAt) {
    return notifications.length;
  }

  return notifications.filter((item) => {
    const createdAt = normalizeDate(item.createdAt);
    return createdAt != null && createdAt > readAt;
  }).length;
}

import type { AppNotification } from "../types";

export function hashNotificationIds(notifications: AppNotification[]): number {
  let hash = 0;
  for (const notification of notifications) {
    for (let i = 0; i < notification.id.length; i += 1) {
      hash = (hash * 31 + notification.id.charCodeAt(i)) | 0;
    }
  }
  return Math.abs(hash);
}

export function pickVariant<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length];
}

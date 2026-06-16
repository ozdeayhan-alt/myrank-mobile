import type { AppNotification, NotificationType } from "../types";

export type GossipGroup = {
  type: NotificationType;
  items: AppNotification[];
};

const AGGREGATABLE_TYPES = new Set<NotificationType>([
  "post_liked",
  "post_commented",
  "message_received",
  "post_saved",
  "post_reposted",
]);

const SINGLE_PRIORITY: NotificationType[] = [
  "rank_passed",
  "user_followed",
  "post_mentioned",
  "profile_votes",
];

const BUCKET_PRIORITY: NotificationType[] = [
  "message_received",
  "post_commented",
  "post_liked",
  "post_saved",
  "post_reposted",
];

export function aggregateGossipEvents(
  notifications: AppNotification[]
): GossipGroup[] {
  const slice = notifications.slice(0, 10);
  const buckets = new Map<NotificationType, AppNotification[]>();
  const singles: AppNotification[] = [];

  for (const notification of slice) {
    if (AGGREGATABLE_TYPES.has(notification.type)) {
      const existing = buckets.get(notification.type) ?? [];
      existing.push(notification);
      buckets.set(notification.type, existing);
    } else {
      singles.push(notification);
    }
  }

  const groups: GossipGroup[] = [];
  const usedSingleIds = new Set<string>();

  for (const type of SINGLE_PRIORITY) {
    for (const notification of singles) {
      if (notification.type !== type || usedSingleIds.has(notification.id)) {
        continue;
      }
      usedSingleIds.add(notification.id);
      groups.push({ type: notification.type, items: [notification] });
    }
  }

  for (const notification of singles) {
    if (usedSingleIds.has(notification.id)) continue;
    groups.push({ type: notification.type, items: [notification] });
  }

  for (const type of BUCKET_PRIORITY) {
    const items = buckets.get(type);
    if (!items?.length) continue;
    groups.push({ type, items });
  }

  return groups;
}

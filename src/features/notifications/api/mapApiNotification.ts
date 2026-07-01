import type { AppNotification, NotificationPayload, NotificationType } from "../types";

const NOTIFICATION_TYPES: NotificationType[] = [
  "post_liked",
  "post_commented",
  "post_saved",
  "post_reposted",
  "message_received",
  "profile_votes",
  "rank_passed",
  "user_followed",
  "post_mentioned",
];

function isNotificationType(value: unknown): value is NotificationType {
  return (
    typeof value === "string" &&
    NOTIFICATION_TYPES.includes(value as NotificationType)
  );
}

function mapPayload(raw: unknown): NotificationPayload {
  if (!raw || typeof raw !== "object") {
    return {};
  }
  const data = raw as Record<string, unknown>;
  const payload: NotificationPayload = {};

  if (typeof data.postId === "string") {
    payload.postId = data.postId;
  }
  if (typeof data.repostId === "string") {
    payload.repostId = data.repostId;
  }
  if (typeof data.conversationId === "string") {
    payload.conversationId = data.conversationId;
  }
  if (typeof data.voteDelta === "number" && Number.isFinite(data.voteDelta)) {
    payload.voteDelta = data.voteDelta;
  }
  if (typeof data.segmentKey === "string") {
    payload.segmentKey = data.segmentKey;
  }
  if (typeof data.segmentLabel === "string") {
    payload.segmentLabel = data.segmentLabel;
  }

  return payload;
}

export function mapApiNotification(item: {
  id: string;
  type: unknown;
  actorId: unknown;
  actorDisplayName: unknown;
  payload: unknown;
  createdAt: string | null;
}): AppNotification | null {
  if (!isNotificationType(item.type)) {
    return null;
  }

  return {
    id: item.id,
    type: item.type,
    actorId: typeof item.actorId === "string" ? item.actorId : "",
    actorDisplayName:
      typeof item.actorDisplayName === "string"
        ? item.actorDisplayName
        : "Biri",
    payload: mapPayload(item.payload),
    createdAt: item.createdAt ? new Date(item.createdAt) : null,
  };
}

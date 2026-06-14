import type { AppNotification } from "../types";
import { formatSegmentLabel } from "./formatSegmentLabel";

function segmentLabelFromPayload(
  payload: AppNotification["payload"]
): string {
  if (payload.segmentLabel?.trim()) {
    return payload.segmentLabel.trim();
  }
  return formatSegmentLabel(payload.segmentKey);
}

/** Single line for list UI */
export function formatNotificationLine(notification: AppNotification): string {
  const name = notification.actorDisplayName.trim() || "Biri";
  const { type, payload } = notification;

  switch (type) {
    case "post_liked":
      return `${name} son gönderini beğendi.`;
    case "post_commented":
      return `${name} gönderine yorum yaptı.`;
    case "post_saved":
      return `${name} gönderini kaydetti.`;
    case "post_reposted":
      return `${name} gönderini akışına paylaştı.`;
    case "message_received":
      return `${name} sana mesaj gönderdi.`;
    case "profile_votes": {
      const delta = payload.voteDelta ?? 0;
      return `${name} profilinde ${delta} beğeni yaptı.`;
    }
    case "rank_passed": {
      const label = segmentLabelFromPayload(payload);
      return `${name} seni ${label} sıralamasında geçti.`;
    }
    case "user_followed":
      return `${name} seni takip etmeye başladı.`;
    case "post_mentioned":
      return `${name} bir gönderide senden bahsetti.`;
    default:
      return `${name} bir şeyler yaptı.`;
  }
}

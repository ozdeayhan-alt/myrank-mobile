import type { AppNotification } from "../types";
import { formatNotificationLine } from "./notificationTemplates";

export const GOSSIP_EMPTY_MESSAGE =
  "Yahu bir şeyler paylaşta gıybet olsun.";

/** TTS script for dedikoducu kadın (last 10 events). */
export function buildGossipScript(notifications: AppNotification[]): string {
  if (notifications.length === 0) {
    return GOSSIP_EMPTY_MESSAGE;
  }

  const lines = notifications
    .slice(0, 10)
    .map((n) => formatNotificationLine(n));

  return [
    "Sen yokken neler oldu, bir dinle.",
    ...lines,
    "Hayırdır inşaAllah, başka bir şey yok.",
  ].join(" ");
}

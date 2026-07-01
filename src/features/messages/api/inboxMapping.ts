import type { InboxEntry } from "../types";

export function mapInboxDoc(
  id: string,
  data: Record<string, unknown>
): InboxEntry {
  return {
    conversationId: id,
    otherUserId: String(data.otherUserId ?? ""),
    otherDisplayName: String(data.otherDisplayName ?? "Kullanıcı"),
    otherPhotoURL: data.otherPhotoURL ? String(data.otherPhotoURL) : undefined,
    lastMessageText: String(data.lastMessageText ?? ""),
    lastMessageAt:
      data.lastMessageAt &&
      typeof (data.lastMessageAt as { toDate?: () => Date }).toDate ===
        "function"
        ? (data.lastMessageAt as { toDate: () => Date }).toDate()
        : null,
    unreadCount:
      typeof data.unreadCount === "number" ? Math.max(0, data.unreadCount) : 0,
  };
}

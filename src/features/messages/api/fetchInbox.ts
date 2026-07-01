import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { InboxEntry } from "../types";

export { mapInboxDoc } from "./inboxMapping";

type InboxApiResponse = {
  ok: boolean;
  entries: Array<{
    conversationId: string;
    otherUserId: string;
    otherDisplayName: string;
    otherPhotoURL?: string;
    lastMessageText: string;
    lastMessageAt: string | null;
    unreadCount: number;
  }>;
  error?: string;
};

export async function fetchInboxEntries(
  _userId: string
): Promise<InboxEntry[]> {
  const response = await fetchApi(`${getApiBaseUrl()}/api/messages/inbox`, {
    method: "GET",
    timeoutMs: 15_000,
  });

  const data = (await response.json()) as InboxApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Mesajlar yüklenemedi");
  }

  return (data.entries ?? []).map((entry) => ({
    conversationId: entry.conversationId,
    otherUserId: entry.otherUserId,
    otherDisplayName: entry.otherDisplayName,
    otherPhotoURL: entry.otherPhotoURL,
    lastMessageText: entry.lastMessageText,
    lastMessageAt: entry.lastMessageAt ? new Date(entry.lastMessageAt) : null,
    unreadCount: entry.unreadCount,
  }));
}

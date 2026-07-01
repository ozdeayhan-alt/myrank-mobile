import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { ChatMessage } from "../types";

type ConversationMessagesApiResponse = {
  ok: boolean;
  messages?: Array<{
    id: string;
    senderId: string;
    type: ChatMessage["type"];
    text?: string;
    mediaURL?: string;
    posterURL?: string;
    createdAt: string | null;
  }>;
  error?: string;
};

function mapApiMessage(
  message: NonNullable<ConversationMessagesApiResponse["messages"]>[number]
): ChatMessage {
  return {
    id: message.id,
    senderId: message.senderId,
    type: message.type,
    ...(message.text ? { text: message.text } : {}),
    ...(message.mediaURL ? { mediaURL: message.mediaURL } : {}),
    ...(message.posterURL ? { posterURL: message.posterURL } : {}),
    createdAt: message.createdAt ? new Date(message.createdAt) : null,
  };
}

export type FetchConversationMessagesOptions = {
  after?: string | null;
};

export async function fetchConversationMessages(
  conversationId: string,
  options: FetchConversationMessagesOptions = {}
): Promise<ChatMessage[]> {
  const params = new URLSearchParams();
  const after = options.after?.trim();
  if (after) {
    params.set("after", after);
  }

  const query = params.toString();
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/messages/conversations/${encodeURIComponent(conversationId)}/messages${query ? `?${query}` : ""}`,
    { method: "GET", timeoutMs: 15_000 }
  );

  const data = (await response.json()) as ConversationMessagesApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Mesajlar yüklenemedi");
  }

  return (data.messages ?? []).map(mapApiMessage);
}

export function mergeConversationMessages(
  existing: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] {
  if (incoming.length === 0) {
    return existing;
  }

  const seen = new Set(existing.map((message) => message.id));
  const merged = [...existing];

  for (const message of incoming) {
    if (seen.has(message.id)) {
      continue;
    }
    merged.push(message);
    seen.add(message.id);
  }

  return merged;
}

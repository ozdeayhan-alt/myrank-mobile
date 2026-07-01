import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

export async function markConversationRead(conversationId: string): Promise<void> {
  const response = await fetchApi(`${getApiBaseUrl()}/api/messages/read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ conversationId }),
    timeoutMs: 20000,
  });

  const data = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Okundu işaretlenemedi");
  }
}

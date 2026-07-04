import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { throwIfNotOk } from "@/lib/apiError";

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
  throwIfNotOk(response, data, data.error ?? "Okundu işaretlenemedi");
}

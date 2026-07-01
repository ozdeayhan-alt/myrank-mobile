import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { SendMessageInput } from "../types";

export async function sendMessage(
  conversationId: string,
  input: SendMessageInput
): Promise<void> {
  const response = await fetchApi(`${getApiBaseUrl()}/api/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversationId,
      ...input,
    }),
    timeoutMs: 20000,
  });

  const data = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Mesaj gönderilemedi");
  }
}

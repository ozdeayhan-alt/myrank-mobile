import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { SendMessageInput } from "../types";

export async function sendMessage(
  conversationId: string,
  input: SendMessageInput
): Promise<void> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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

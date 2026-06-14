import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { OpenConversationResult } from "../types";

export async function openConversation(
  targetUserId: string
): Promise<OpenConversationResult> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/messages/conversations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targetUserId }),
      timeoutMs: 20000,
    }
  );

  const data = (await response.json()) as OpenConversationResult & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Sohbet açılamadı");
  }

  return data;
}

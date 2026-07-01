import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { OpenConversationResult } from "../types";

export async function openConversation(
  targetUserId: string
): Promise<OpenConversationResult> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/messages/conversations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

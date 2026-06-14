import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { InteractionResponse } from "../types";

export type InteractionSessionRequest = {
  postId: string;
  liked: boolean;
  disliked: boolean;
};

export async function fetchInteractionSession(
  request: InteractionSessionRequest
): Promise<InteractionResponse> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/interactions/session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
      timeoutMs: 20000,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const apiError =
      typeof data.error === "string" && data.error.trim()
        ? data.error.trim()
        : "Oturum senkronu başarısız";
    throw new Error(apiError);
  }

  return data as InteractionResponse;
}

import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { EngagementStatus } from "../types";

type BatchEngagementResponse = {
  ok: boolean;
  engagements: Record<string, EngagementStatus>;
};

export async function fetchBatchEngagement(
  postIds: string[]
): Promise<Record<string, EngagementStatus>> {
  const uniqueIds = [...new Set(postIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return {};
  }

  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/interactions/engagements/batch`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postIds: uniqueIds }),
      timeoutMs: 20000,
    }
  );

  const data = (await response.json()) as BatchEngagementResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Batch engagement request failed");
  }

  return data.engagements ?? {};
}

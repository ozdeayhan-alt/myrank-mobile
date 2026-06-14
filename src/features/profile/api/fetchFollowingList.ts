import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { FollowListResponse } from "../types/followLists";

type FetchFollowingListParams = {
  cursor?: string | null;
  limit?: number;
};

export async function fetchFollowingList({
  cursor = null,
  limit = 30,
}: FetchFollowingListParams = {}) {
  const token = await getApiAuthToken();
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/follows/me/following${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeoutMs: 20000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as FollowListResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Takip edilenler alınamadı");
  }

  return {
    users: data.users ?? [],
    nextCursor: data.nextCursor ?? null,
  };
}

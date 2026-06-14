import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { FollowCounts } from "../types/followLists";

type FollowCountsResponse = FollowCounts & {
  ok: boolean;
  error?: string;
};

export async function fetchFollowCounts(): Promise<FollowCounts> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/follows/me/counts`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as FollowCountsResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Takip sayıları alınamadı");
  }

  return {
    followingCount: data.followingCount ?? 0,
    followersCount: data.followersCount ?? 0,
  };
}

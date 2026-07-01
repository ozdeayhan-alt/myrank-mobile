import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { FollowCounts } from "../types/followLists";

type FollowCountsResponse = FollowCounts & {
  ok: boolean;
  error?: string;
};

export async function fetchFollowCounts(): Promise<FollowCounts> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/follows/me/counts`,
    {
      method: "GET",
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

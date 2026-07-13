import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import { throwIfNotOk } from "@/lib/apiError";
import type { FollowListResponse } from "../types/followLists";

type FetchFollowersListParams = {
  cursor?: string | null;
  limit?: number;
};

export async function fetchFollowersList({
  cursor = null,
  limit = 30,
}: FetchFollowersListParams = {}) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/follows/me/followers${query ? `?${query}` : ""}`,
    {
      method: "GET",
      timeoutMs: 20000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as FollowListResponse;
  throwIfNotOk(response, data, data.error ?? "Takipçiler alınamadı");

  return {
    users: data.users ?? [],
    nextCursor: data.nextCursor ?? null,
  };
}

import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

export type FollowStatusResponse = {
  ok: boolean;
  targetUserId: string;
  following: boolean;
  error?: string;
};

export async function fetchFollowStatus(
  targetUserId: string
): Promise<boolean> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/follows/${encodeURIComponent(targetUserId)}/status`,
    {
      method: "GET",
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as FollowStatusResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Takip durumu alınamadı");
  }

  return data.following;
}

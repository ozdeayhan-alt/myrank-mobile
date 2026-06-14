import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

export type FollowStatusResponse = {
  ok: boolean;
  targetUserId: string;
  following: boolean;
  error?: string;
};

export async function fetchFollowStatus(
  targetUserId: string
): Promise<boolean> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/follows/${encodeURIComponent(targetUserId)}/status`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as FollowStatusResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Takip durumu alınamadı");
  }

  return data.following;
}

import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type FollowResponse = {
  ok: boolean;
  targetUserId: string;
  following: boolean;
  error?: string;
};

export async function followUser(targetUserId: string): Promise<void> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/follows/${encodeURIComponent(targetUserId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as FollowResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Takip edilemedi");
  }
}

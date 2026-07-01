import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

type FollowResponse = {
  ok: boolean;
  targetUserId: string;
  following: boolean;
  error?: string;
};

export async function followUser(targetUserId: string): Promise<void> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/follows/${encodeURIComponent(targetUserId)}`,
    {
      method: "POST",
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as FollowResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Takip edilemedi");
  }
}

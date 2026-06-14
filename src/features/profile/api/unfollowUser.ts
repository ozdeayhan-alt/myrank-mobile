import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type UnfollowResponse = {
  ok: boolean;
  targetUserId: string;
  following: boolean;
  error?: string;
};

export async function unfollowUser(targetUserId: string): Promise<void> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/follows/${encodeURIComponent(targetUserId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as UnfollowResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Takipten çıkılamadı");
  }
}

import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

type UnfollowResponse = {
  ok: boolean;
  targetUserId: string;
  following: boolean;
  error?: string;
};

export async function unfollowUser(targetUserId: string): Promise<void> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/follows/${encodeURIComponent(targetUserId)}`,
    {
      method: "DELETE",
      timeoutMs: 15000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as UnfollowResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Takipten çıkılamadı");
  }
}

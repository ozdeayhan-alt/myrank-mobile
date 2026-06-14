import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type FanOutResponse = {
  ok?: boolean;
  fanOutCount?: number;
  error?: string;
};

export async function notifyPostFanOut(postId: string): Promise<void> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/posts/${postId}/fan-out`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeoutMs: 20000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as FanOutResponse;

  if (!response.ok) {
    throw new Error(data.error ?? `Fan-out failed (${response.status})`);
  }
}

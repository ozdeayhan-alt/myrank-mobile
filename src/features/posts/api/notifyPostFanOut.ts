import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

type FanOutResponse = {
  ok?: boolean;
  fanOutCount?: number;
  error?: string;
};

export async function notifyPostFanOut(postId: string): Promise<void> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/posts/${postId}/fan-out`,
    {
      method: "POST",
      timeoutMs: 20000,
    }
  );

  const data = (await response.json().catch(() => ({}))) as FanOutResponse;

  if (!response.ok) {
    throw new Error(data.error ?? `Fan-out failed (${response.status})`);
  }
}

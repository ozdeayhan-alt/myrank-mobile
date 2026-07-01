import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

export async function recordStoryView(storyId: string): Promise<{
  ok: boolean;
  storyId: string;
  viewCount: number;
  recorded: boolean;
}> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/stories/${encodeURIComponent(storyId)}/view`,
    {
      method: "POST",
      timeoutMs: 15000,
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story görüntüleme kaydedilemedi");
  }

  return data;
}

import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { StoryEngagement } from "../constants/types";

export async function fetchStoryEngagement(
  storyId: string
): Promise<StoryEngagement> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/stories/${encodeURIComponent(storyId)}/engagement`,
    {
      timeoutMs: 15000,
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story etkileşimi alınamadı");
  }

  return {
    storyId: data.storyId,
    liked: Boolean(data.liked),
    voteNet: data.voteNet ?? 0,
  };
}

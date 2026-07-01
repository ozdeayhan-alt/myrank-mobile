import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { StoryInsights } from "../constants/types";

export async function fetchStoryInsights(storyId: string): Promise<StoryInsights> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/stories/${encodeURIComponent(storyId)}/insights`,
    {
      timeoutMs: 15000,
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story istatistikleri alınamadı");
  }

  return {
    storyId: data.storyId,
    viewCount: data.viewCount ?? 0,
    heartLikeCount: data.heartLikeCount ?? 0,
    storyScore: data.storyScore ?? 0,
    viewers: data.viewers ?? [],
    likers: data.likers ?? [],
  };
}

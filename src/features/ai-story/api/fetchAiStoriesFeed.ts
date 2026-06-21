import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { AiStory } from "../constants/types";

export async function fetchAiStoriesFeed(limit = 30): Promise<AiStory[]> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/ai-stories/feed?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story feed alınamadı");
  }

  return (data.stories ?? []) as AiStory[];
}

export async function fetchAiStoryById(storyId: string): Promise<AiStory> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/ai-stories/${encodeURIComponent(storyId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story bulunamadı");
  }

  return data.story as AiStory;
}

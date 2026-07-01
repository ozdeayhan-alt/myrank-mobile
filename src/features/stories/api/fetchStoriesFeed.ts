import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { Story } from "../constants/types";

export async function fetchStoriesFeed(limit = 30): Promise<Story[]> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/stories/feed?limit=${limit}`
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story feed alınamadı");
  }

  return (data.stories ?? []) as Story[];
}

export async function fetchStoryById(storyId: string): Promise<Story> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/stories/${encodeURIComponent(storyId)}`
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story bulunamadı");
  }

  return data.story as Story;
}

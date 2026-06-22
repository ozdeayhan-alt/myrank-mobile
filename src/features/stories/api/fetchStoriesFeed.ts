import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { Story } from "../constants/types";

export async function fetchStoriesFeed(limit = 30): Promise<Story[]> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/stories/feed?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story feed alınamadı");
  }

  return (data.stories ?? []) as Story[];
}

export async function fetchStoryById(storyId: string): Promise<Story> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/stories/${encodeURIComponent(storyId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story bulunamadı");
  }

  return data.story as Story;
}

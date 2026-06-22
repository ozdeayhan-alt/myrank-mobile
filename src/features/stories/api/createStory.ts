import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { Story, StoryMediaType } from "../constants/types";

export type CreateStoryInput = {
  mediaType: StoryMediaType;
  mediaURL: string;
  posterURL?: string | null;
  caption?: string | null;
};

export async function createStory(input: CreateStoryInput): Promise<Story> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story paylaşılamadı");
  }

  return data.story as Story;
}

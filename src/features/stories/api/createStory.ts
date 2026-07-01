import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { Story, StoryMediaType } from "../constants/types";

export type CreateStoryInput = {
  mediaType: StoryMediaType;
  mediaURL: string;
  posterURL?: string | null;
  caption?: string | null;
};

export async function createStory(input: CreateStoryInput): Promise<Story> {
  const response = await fetchApi(`${getApiBaseUrl()}/api/stories`, {
    method: "POST",
    headers: {
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

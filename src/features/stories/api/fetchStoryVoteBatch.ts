import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { StoryEngagement, StoryVoteCounts } from "../constants/types";

export type StoryVoteBatchResponse = {
  ok: boolean;
  storyId: string;
  authorId: string;
  storyScore: number;
  authorTotalScore: number;
  delta: number;
  scoreDelta: number;
  counts: StoryVoteCounts;
  engagement: StoryEngagement;
};

export async function fetchStoryVoteBatch(
  storyId: string,
  delta: number
): Promise<StoryVoteBatchResponse> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/story-votes/batch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storyId, delta }),
      timeoutMs: 20000,
    }
  );

  const data = (await response.json()) as StoryVoteBatchResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Story oyu gönderilemedi");
  }

  return data;
}

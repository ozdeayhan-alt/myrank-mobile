import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { AiStory } from "../constants/types";

export type CreateAiStoryInput = {
  moodKey: string;
  locationKey: string;
  actionKey: string;
  caption?: string | null;
};

export async function createAiStory(input: CreateAiStoryInput): Promise<AiStory> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/ai-stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story oluşturulamadı");
  }

  return data.story as AiStory;
}

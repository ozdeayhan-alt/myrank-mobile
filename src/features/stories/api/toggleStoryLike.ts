import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

export async function toggleStoryLike(storyId: string): Promise<{
  ok: boolean;
  storyId: string;
  liked: boolean;
  heartLikeCount: number;
}> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/stories/${encodeURIComponent(storyId)}/like`,
    {
      method: "POST",
      timeoutMs: 15000,
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? "Story beğenisi gönderilemedi");
  }

  return data;
}

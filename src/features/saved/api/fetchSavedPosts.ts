import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { Post } from "@/features/posts/types";
import { applyFeedPageEngagements, type FeedPageResult } from "@/features/posts/api/fetchFeedPage";

type SavedFeedResponse = FeedPageResult & {
  ok: boolean;
  error?: string;
};

export async function fetchSavedPosts(userId: string): Promise<Post[]> {
  void userId;
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(`${getApiBaseUrl()}/api/feed/saved`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeoutMs: 20000,
  });

  const data = (await response.json()) as SavedFeedResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Saved posts request failed");
  }

  applyFeedPageEngagements(data);
  return data.posts ?? [];
}

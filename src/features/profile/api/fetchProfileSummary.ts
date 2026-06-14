import { getApiBaseUrl } from "@/lib/api";
import { getApiAuthToken } from "@/lib/apiAuthToken";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import type { RankingLadderResult } from "@/features/profile/api/fetchRankingLadder";
import type { PublicProfile } from "@/features/profile/api/getPublicProfile";
import type { FeedPageResult } from "@/features/posts/api/fetchFeedPage";
import { applyFeedPageEngagements } from "@/features/posts/api/fetchFeedPage";

export type ProfileSummaryResult = {
  profile: PublicProfile | null;
  ladderSnapshot: RankingLadderResult;
  postsPage: FeedPageResult;
};

type ProfileSummaryResponse = ProfileSummaryResult & {
  ok: boolean;
  error?: string;
};

export async function fetchProfileSummary(
  userId: string,
  postsLimit = 15
): Promise<ProfileSummaryResult> {
  const token = await getApiAuthToken();
  const response = await fetchWithTimeout(
    `${getApiBaseUrl()}/api/profile/${encodeURIComponent(userId)}/summary?postsLimit=${postsLimit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeoutMs: 25000,
    }
  );

  const data = (await response.json()) as ProfileSummaryResponse;

  if (!response.ok) {
    throw new Error(data.error ?? "Profile summary request failed");
  }

  if (data.postsPage) {
    applyFeedPageEngagements(data.postsPage);
  }

  return {
    profile: data.profile,
    ladderSnapshot: data.ladderSnapshot,
    postsPage: data.postsPage,
  };
}

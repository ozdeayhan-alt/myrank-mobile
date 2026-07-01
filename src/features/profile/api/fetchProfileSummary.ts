import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";
import type { RankingLadderResult } from "@/features/profile/api/fetchRankingLadder";
import type { PublicProfile } from "@/features/profile/api/getPublicProfile";
import type { CategoryRanking } from "@/features/profile/api/fetchProfileRankings";
import type { FeedPageResult } from "@/features/posts/api/fetchFeedPage";
import { applyFeedPageEngagements } from "@/features/posts/api/fetchFeedPage";
import { sanitizeApiPublicProfile } from "@/features/profile/api/profileDocParsing";

export type ProfileSummaryResult = {
  profile: PublicProfile | null;
  rankings: CategoryRanking[];
  ladderSegmentKey: string;
  ladderSnapshot: RankingLadderResult;
  ladderSnapshotsBySegmentKey?: Record<string, RankingLadderResult>;
  postsPage: FeedPageResult;
};

type ProfileSummaryResponse = ProfileSummaryResult & {
  ok: boolean;
  error?: string;
  ladderSegmentKey?: string;
};

export async function fetchProfileSummary(
  userId: string,
  postsLimit = 15
): Promise<ProfileSummaryResult> {
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/profile/${encodeURIComponent(userId)}/summary?postsLimit=${postsLimit}`,
    {
      method: "GET",
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
    profile: data.profile ? sanitizeApiPublicProfile(data.profile) : null,
    rankings: data.rankings ?? [],
    ladderSegmentKey: data.ladderSegmentKey ?? "global",
    ladderSnapshot: data.ladderSnapshot,
    ladderSnapshotsBySegmentKey: data.ladderSnapshotsBySegmentKey,
    postsPage: data.postsPage,
  };
}

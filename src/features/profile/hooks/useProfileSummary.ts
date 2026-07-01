import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { AuthorPostsPage } from "@/features/posts/api/fetchPostsByAuthor";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import {
  fetchProfileSummary,
  type ProfileSummaryResult,
} from "../api/fetchProfileSummary";
import type { ProfileGaugeBootstrapResult } from "../api/fetchProfileGaugeBootstrap";
import { authorPostsQueryKey } from "./useAuthorPosts";
import { profileRankingsQueryKey } from "./useProfileRankings";
import {
  rankingLadderSnapshotQueryKey,
} from "./useRankingLadder";
import { publicProfileQueryKey } from "./usePublicProfile";
import { EMPTY_METADATA, type UserMetadata } from "../types";

export const profileSummaryQueryKey = (userId: string, feedVersion: number) =>
  ["profile", "summary", userId, feedVersion] as const;

export function seedProfileGaugeCaches(
  queryClient: QueryClient,
  userId: string,
  metadata: UserMetadata,
  gauge: ProfileGaugeBootstrapResult
): void {
  queryClient.setQueryData(
    profileRankingsQueryKey(userId, metadata),
    gauge.rankings ?? []
  );

  const snapshotsByKey = gauge.ladderSnapshotsBySegmentKey;
  if (snapshotsByKey && typeof snapshotsByKey === "object") {
    for (const [segmentKey, snapshot] of Object.entries(snapshotsByKey)) {
      queryClient.setQueryData(
        rankingLadderSnapshotQueryKey(userId, segmentKey),
        snapshot
      );
    }
  } else {
    queryClient.setQueryData(
      rankingLadderSnapshotQueryKey(userId, gauge.ladderSegmentKey),
      gauge.ladderSnapshot
    );
  }
}

export function seedProfileSummaryCaches(
  queryClient: QueryClient,
  userId: string,
  metadata: UserMetadata,
  feedVersion: number,
  summary: ProfileSummaryResult
): void {
  const seedMetadata = summary.profile?.metadata ?? metadata;

  if (summary.profile) {
    queryClient.setQueryData(publicProfileQueryKey(userId), summary.profile);
  }

  seedProfileGaugeCaches(queryClient, userId, seedMetadata, {
    rankings: summary.rankings ?? [],
    ladderSegmentKey: summary.ladderSegmentKey,
    ladderSnapshot: summary.ladderSnapshot,
    ladderSnapshotsBySegmentKey: summary.ladderSnapshotsBySegmentKey,
  });

  const postsPage: AuthorPostsPage = {
    posts: summary.postsPage.posts,
    cursor: summary.postsPage.cursor,
    hasMore: summary.postsPage.hasMore,
  };

  queryClient.setQueryData(
    authorPostsQueryKey(userId, feedVersion),
    (existing: { pages: AuthorPostsPage[]; pageParams: unknown[] } | undefined) => {
      if (existing?.pages?.length) {
        return existing;
      }
      return {
        pages: [postsPage],
        pageParams: [null],
      };
    }
  );
}

export function useProfileSummary(
  userId: string | undefined,
  metadata: UserMetadata,
  enabled = true
) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);

  return useQuery({
    queryKey: profileSummaryQueryKey(userId ?? "", feedVersion),
    queryFn: async () => {
      const summary = await fetchProfileSummary(userId!, 15);
      seedProfileSummaryCaches(
        queryClient,
        userId!,
        summary.profile?.metadata ?? metadata ?? EMPTY_METADATA,
        feedVersion,
        summary
      );
      return summary;
    },
    enabled: Boolean(userId) && enabled,
    staleTime: 60_000,
  });
}

/** Subscribe to summary fetch state from profile-scoped queries. */
export function useProfileSummaryStatus(userId: string | undefined) {
  const feedVersion = useFeedRefreshStore((s) => s.version);

  return useQuery<ProfileSummaryResult>({
    queryKey: profileSummaryQueryKey(userId ?? "", feedVersion),
    enabled: false,
  });
}

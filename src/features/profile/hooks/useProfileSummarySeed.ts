import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthorPostsPage } from "@/features/posts/api/fetchPostsByAuthor";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import { fetchProfileSummary } from "../api/fetchProfileSummary";
import type { RankingLadderResult } from "../api/fetchRankingLadder";
import { authorPostsQueryKey } from "../hooks/useAuthorPosts";
import { rankingLadderSnapshotQueryKey } from "../hooks/useRankingLadder";

export function useProfileSummarySeed(userId: string, enabled = true) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    let cancelled = false;

    void fetchProfileSummary(userId, 15).then((summary) => {
      if (cancelled) {
        return;
      }

      queryClient.setQueryData<RankingLadderResult>(
        rankingLadderSnapshotQueryKey(userId),
        summary.ladderSnapshot
      );

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
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, feedVersion, queryClient, userId]);
}

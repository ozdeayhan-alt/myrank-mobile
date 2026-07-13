import type { InfiniteData } from "@tanstack/react-query";
import { patchPublicProfileTotalScore } from "@/features/profile/lib/patchPublicProfileTotalScore";
import {
  patchPostInPages,
  type PostScoreUpdate,
} from "@/features/posts/utils/patchPostInCache";
import type { FeedPageResult } from "@/features/posts/api/fetchFeedPage";
import {
  postVoteDisplayKey,
  resetVoteDisplay,
} from "@/features/ranking/vote/voteDisplayStore";
import { queryClient } from "@/lib/queryClient";
import type { DuelVoteBatchResult } from "../types";

function isFeedPostsQuery(queryKey: readonly unknown[]): boolean {
  if (!Array.isArray(queryKey) || queryKey.length < 2) {
    return false;
  }
  return queryKey[0] === "feed" || queryKey[0] === "hashtag";
}

function patchFeedCaches(postId: string, update: PostScoreUpdate): void {
  queryClient.setQueriesData<InfiniteData<FeedPageResult>>(
    {
      predicate: (query) => isFeedPostsQuery(query.queryKey),
    },
    (old) => patchPostInPages(old, postId, update)
  );
}

export function applyDuelFlushResults(results: DuelVoteBatchResult[]): void {
  for (const result of results) {
    resetVoteDisplay(postVoteDisplayKey(result.postId), result.postScore);
    patchPublicProfileTotalScore(
      queryClient,
      result.authorId,
      result.authorTotalScore
    );

    const update: PostScoreUpdate = result.counts
      ? { postScore: result.postScore, counts: result.counts }
      : { postScore: result.postScore };
    patchFeedCaches(result.postId, update);
  }
}

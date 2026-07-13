import { useExploreFeedInfinite } from "@/features/explore/hooks/useExploreFeedInfinite";
import type { FeedApiContentType } from "@/features/feed/feedContentType";
import { injectDuelCards } from "@/features/duel/lib/injectDuelCards";
import type { UserMetadata } from "@/features/profile/types";
import { useMemo } from "react";
import { useFeedEngineState, useBufferedPosts } from "../FeedEngine";
import { mapPostsToFeedItems } from "../filtering";
import type { FeedEngineResult } from "../FeedEngine.types";

export function useExploreFeedEngine(
  filters: UserMetadata | null,
  contentType: FeedApiContentType,
  enabled = true
): FeedEngineResult {
  const exploreFeed = useExploreFeedInfinite(filters, contentType, enabled);

  const bufferedPosts = useBufferedPosts(
    exploreFeed.posts,
    `explore-v2-${exploreFeed.filterKey}-${contentType}`,
    exploreFeed.hasNextPage,
    exploreFeed.isFetchingNextPage
  );

  const items = useMemo(() => {
    const mapped = mapPostsToFeedItems(bufferedPosts);
    return injectDuelCards(mapped);
  }, [bufferedPosts]);

  return useFeedEngineState({
    posts: bufferedPosts,
    items,
    loading: exploreFeed.loading,
    error: exploreFeed.error,
    hasNextPage: exploreFeed.hasNextPage,
    isFetchingNextPage: exploreFeed.isFetchingNextPage,
    isFetching: exploreFeed.isFetching,
    isRefetching: exploreFeed.isRefetching,
    refresh: exploreFeed.refresh,
    fetchNextPage: exploreFeed.fetchNextPage,
    updatePostScore: exploreFeed.updatePostScore,
  });
}

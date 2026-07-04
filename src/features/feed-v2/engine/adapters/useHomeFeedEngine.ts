import type { HomeFeedMode } from "@/components/HomeFeedModeToggle";
import { toFeedApiContentType } from "@/features/feed/feedContentType";
import { useFollowingFeedInfinite } from "@/features/explore/hooks/useFollowingFeedInfinite";
import { useHomeFeedInfinite } from "@/features/explore/hooks/useHomeFeedInfinite";
import { injectDuelCards } from "@/features/duel/lib/injectDuelCards";
import type { HomeFeedContentFilter } from "@/features/posts/store/useHomeFeedContentStore";
import { useMemo } from "react";
import { useFeedEngineState, useBufferedPosts } from "../FeedEngine";
import { mapPostsToFeedItems } from "../filtering";
import type { FeedEngineResult } from "../FeedEngine.types";

export function useHomeFeedEngine(
  feedMode: HomeFeedMode,
  contentFilter: HomeFeedContentFilter,
  enabled = true
): FeedEngineResult {
  const apiContentType = toFeedApiContentType(contentFilter);
  const globalFeed = useHomeFeedInfinite(
    apiContentType,
    enabled && feedMode === "global"
  );
  const followingFeed = useFollowingFeedInfinite(
    apiContentType,
    enabled && feedMode === "following"
  );
  const activeFeed = feedMode === "global" ? globalFeed : followingFeed;

  const rawPosts =
    feedMode === "global" ? globalFeed.recentPosts : followingFeed.posts;

  const bufferedPosts = useBufferedPosts(
    rawPosts,
    `home-v2-${feedMode}-${apiContentType}`,
    activeFeed.hasNextPage,
    activeFeed.isFetchingNextPage
  );

  const items = useMemo(() => {
    const mapped = mapPostsToFeedItems(bufferedPosts);
    if (contentFilter != null) {
      return mapped;
    }
    return injectDuelCards(mapped);
  }, [bufferedPosts, contentFilter]);

  return useFeedEngineState({
    posts: bufferedPosts,
    items,
    loading: activeFeed.loading,
    error: activeFeed.error,
    hasNextPage: activeFeed.hasNextPage,
    isFetchingNextPage: activeFeed.isFetchingNextPage,
    isFetching: activeFeed.isFetching,
    isRefetching: activeFeed.isRefetching,
    refresh: activeFeed.refresh,
    fetchNextPage: activeFeed.fetchNextPage,
    updatePostScore: activeFeed.updatePostScore,
  });
}

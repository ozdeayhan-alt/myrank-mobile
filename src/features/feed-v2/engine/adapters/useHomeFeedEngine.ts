import type { HomeFeedMode } from "@/components/HomeFeedModeToggle";
import { useFollowingFeedInfinite } from "@/features/explore/hooks/useFollowingFeedInfinite";
import { useHomeFeedInfinite } from "@/features/explore/hooks/useHomeFeedInfinite";
import type { HomeFeedContentFilter } from "@/features/posts/store/useHomeFeedContentStore";
import { useFeedEngineState, useBufferedPosts } from "../FeedEngine";
import type { FeedEngineResult } from "../FeedEngine.types";

export function useHomeFeedEngine(
  feedMode: HomeFeedMode,
  contentFilter: HomeFeedContentFilter,
  enabled = true
): FeedEngineResult {
  const globalFeed = useHomeFeedInfinite(enabled && feedMode === "global");
  const followingFeed = useFollowingFeedInfinite(
    enabled && feedMode === "following"
  );
  const activeFeed = feedMode === "global" ? globalFeed : followingFeed;

  const rawPosts =
    feedMode === "global" ? globalFeed.recentPosts : followingFeed.posts;

  const bufferedPosts = useBufferedPosts(
    rawPosts,
    `home-v2-${feedMode}`,
    activeFeed.hasNextPage,
    activeFeed.isFetchingNextPage
  );

  return useFeedEngineState({
    posts: bufferedPosts,
    contentFilter,
    loading: activeFeed.loading,
    error: activeFeed.error,
    hasNextPage: activeFeed.hasNextPage,
    isFetchingNextPage: activeFeed.isFetchingNextPage,
    isRefetching: activeFeed.isRefetching,
    refresh: activeFeed.refresh,
    fetchNextPage: activeFeed.fetchNextPage,
    updatePostScore: activeFeed.updatePostScore,
  });
}

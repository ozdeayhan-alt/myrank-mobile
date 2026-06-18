import { useMemo } from "react";
import type { HomeFeedMode } from "@/components/HomeFeedModeToggle";
import { useFollowingFeedInfinite } from "@/features/explore/hooks/useFollowingFeedInfinite";
import { useHomeFeedInfinite } from "@/features/explore/hooks/useHomeFeedInfinite";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import { filterVideoPosts } from "../utils/videoPosts";

/** Ana sayfa video akışı — global veya takip moduna göre. */
export function useReelsFeedInfinite(
  enabled = true,
  feedMode: HomeFeedMode = "global"
) {
  const feedVersion = useFeedRefreshStore((s) => s.version);
  const globalFeed = useHomeFeedInfinite(enabled && feedMode === "global");
  const followingFeed = useFollowingFeedInfinite(
    enabled && feedMode === "following"
  );

  const videoPosts = useMemo(() => {
    if (feedMode === "following") {
      return filterVideoPosts(followingFeed.posts);
    }

    return filterVideoPosts(globalFeed.recentPosts);
  }, [feedMode, followingFeed.posts, globalFeed.recentPosts]);

  const activeFeed = feedMode === "global" ? globalFeed : followingFeed;
  const engagementResetKey = `reels-${feedMode}-${feedVersion}`;

  return {
    videoPosts,
    loading: activeFeed.loading,
    error: activeFeed.error,
    refresh: activeFeed.refresh,
    updatePostScore: activeFeed.updatePostScore,
    hasNextPage: activeFeed.hasNextPage,
    isFetchingNextPage: activeFeed.isFetchingNextPage,
    fetchNextPage: activeFeed.fetchNextPage,
    isRefetching: activeFeed.isRefetching,
    engagementResetKey,
  };
}

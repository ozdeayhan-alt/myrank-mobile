import { collectVideoPostsForPlaylist } from "@/features/posts/utils/videoPosts";
import { useFeedBuffer } from "@/features/feed/useFeedBuffer";
import { useMemo } from "react";
import type { FeedEngineInput, FeedEngineResult } from "./FeedEngine.types";
import { mapPostsToFeedItems } from "./filtering";

export function useFeedEngineState(input: FeedEngineInput): FeedEngineResult {
  const {
    posts,
    contentFilter,
    loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refresh,
    fetchNextPage,
    updatePostScore,
  } = input;

  const listContentFilter =
    contentFilter === "video" ? null : contentFilter;

  const items = useMemo(
    () => mapPostsToFeedItems(posts, listContentFilter),
    [posts, listContentFilter]
  );

  const videoPosts = useMemo(
    () => collectVideoPostsForPlaylist(posts),
    [posts]
  );

  return {
    posts,
    videoPosts,
    items,
    loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refresh,
    fetchNextPage,
    updatePostScore,
  };
}

export function useBufferedPosts(
  posts: import("@/features/posts/types").Post[],
  feedKey: string,
  hasNextPage: boolean,
  isFetchingNextPage: boolean
) {
  return useFeedBuffer(posts, { feedKey, hasNextPage, isFetchingNextPage });
}

import { useFeedBuffer } from "@/features/feed/useFeedBuffer";
import { useMemo } from "react";
import type { FeedEngineInput, FeedEngineResult } from "./FeedEngine.types";
import { mapPostsToFeedItems } from "./filtering";

export function useFeedEngineState(input: FeedEngineInput): FeedEngineResult {
  const {
    posts,
    items: inputItems,
    loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isRefetching,
    refresh,
    fetchNextPage,
    updatePostScore,
  } = input;

  const items = useMemo(
    () => inputItems ?? mapPostsToFeedItems(posts),
    [inputItems, posts]
  );

  return {
    posts,
    items,
    loading,
    error,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
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

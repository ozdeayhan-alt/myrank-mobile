import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image } from "expo-image";
import type { Post } from "@/features/posts/types";
import { useFlowViewerSessionStore } from "../store/useFlowViewerSessionStore";
import { useFlowFeedInfinite } from "./useFlowFeedInfinite";

/**
 * Flow detail navigation without remounting the screen.
 * Uses router.setParams so the same FlowDetailContent stays mounted
 * and the player pool can keep adjacent WebViews warm.
 */
export function useFlowDetailNavigation(postId: string) {
  const router = useRouter();
  const session = useFlowViewerSessionStore((state) => state.session);
  const [pendingNext, setPendingNext] = useState(false);

  const feed = useFlowFeedInfinite({
    variant: session?.variant ?? "home",
    filters: session?.filters ?? null,
    authorId: session?.authorId ?? undefined,
    enabled: true,
  });

  const currentIndex = useMemo(
    () => feed.posts.findIndex((entry) => entry.id === postId),
    [feed.posts, postId]
  );

  const nextPost = useMemo((): Post | null => {
    if (currentIndex < 0) {
      return null;
    }
    return feed.posts[currentIndex + 1] ?? null;
  }, [currentIndex, feed.posts]);

  const previousPost = useMemo((): Post | null => {
    if (currentIndex <= 0) {
      return null;
    }
    return feed.posts[currentIndex - 1] ?? null;
  }, [currentIndex, feed.posts]);

  const hasFeedNavigation = currentIndex >= 0;

  useEffect(() => {
    if (!hasFeedNavigation) {
      return;
    }

    const remaining = feed.posts.length - 1 - currentIndex;
    if (remaining <= 2 && feed.hasNextPage && !feed.isFetchingNextPage) {
      feed.fetchNextPage();
    }
  }, [
    currentIndex,
    feed.fetchNextPage,
    feed.hasNextPage,
    feed.isFetchingNextPage,
    feed.posts.length,
    hasFeedNavigation,
  ]);

  useEffect(() => {
    const urls = [
      nextPost?.thumbnailUrl ?? nextPost?.posterURL,
      previousPost?.thumbnailUrl ?? previousPost?.posterURL,
    ];
    for (const thumbnailUrl of urls) {
      if (thumbnailUrl) {
        void Image.prefetch(thumbnailUrl, { cachePolicy: "memory-disk" });
      }
    }
  }, [
    nextPost?.posterURL,
    nextPost?.thumbnailUrl,
    previousPost?.posterURL,
    previousPost?.thumbnailUrl,
  ]);

  const goToPost = useCallback(
    (target: Post) => {
      // Keep the same screen mounted — only swap the route param.
      router.setParams({ postId: target.id });
    },
    [router]
  );

  useEffect(() => {
    setPendingNext(false);
  }, [postId]);

  useEffect(() => {
    if (!pendingNext || !nextPost) {
      return;
    }

    goToPost(nextPost);
    setPendingNext(false);
  }, [goToPost, nextPost, pendingNext]);

  const goToNext = useCallback(() => {
    if (nextPost) {
      goToPost(nextPost);
      setPendingNext(false);
      return;
    }

    if (feed.hasNextPage && !feed.isFetchingNextPage) {
      setPendingNext(true);
      void feed.fetchNextPage();
    }
  }, [
    feed.fetchNextPage,
    feed.hasNextPage,
    feed.isFetchingNextPage,
    goToPost,
    nextPost,
  ]);

  const goToPrevious = useCallback(() => {
    if (previousPost) {
      goToPost(previousPost);
    }
  }, [goToPost, previousPost]);

  const canGoNext =
    hasFeedNavigation && (Boolean(nextPost) || feed.hasNextPage);
  const canGoPrevious = hasFeedNavigation && Boolean(previousPost);
  const isLoadingNext =
    hasFeedNavigation &&
    (pendingNext || (!nextPost && feed.hasNextPage && feed.isFetchingNextPage));

  return {
    hasFeedNavigation,
    nextPost,
    previousPost,
    canGoNext,
    canGoPrevious,
    isLoadingNext,
    goToNext,
    goToPrevious,
    updatePostScore: feed.updatePostScore,
  };
}

import { useEffect, useRef } from "react";
import type { Post } from "@/features/posts/types";
import { isFeedBufferEnabled } from "@/lib/featureFlags/feedFlags";
import { feedPerfLog } from "@/lib/feedPerfLog";

type UseFeedBufferOptions = {
  feedKey: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

/**
 * Phase 1 buffer layer — pass-through + hit/miss telemetry.
 * useInfiniteQuery davranışını değiştirmez.
 */
export function useFeedBuffer(
  posts: Post[],
  { feedKey, hasNextPage, isFetchingNextPage }: UseFeedBufferOptions
): Post[] {
  const enabled = isFeedBufferEnabled();
  const snapshotRef = useRef<{ key: string; ids: string } | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const ids = posts.map((post) => post.id).join(",");
    const previous = snapshotRef.current;

    if (previous?.key === feedKey && previous.ids === ids) {
      feedPerfLog("buffer", {
        hit: true,
        feedKey,
        count: posts.length,
        hasNextPage,
        isFetchingNextPage,
      });
      return;
    }

    feedPerfLog("buffer", {
      hit: false,
      feedKey,
      count: posts.length,
      hasNextPage,
      isFetchingNextPage,
    });

    snapshotRef.current = { key: feedKey, ids };
  }, [enabled, feedKey, posts, hasNextPage, isFetchingNextPage]);

  return posts;
}

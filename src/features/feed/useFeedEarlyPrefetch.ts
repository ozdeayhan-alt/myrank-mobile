import { useCallback, useEffect, useRef } from "react";
import { computePrefetchTriggerIndex } from "./feedPagination";

type UseFeedEarlyPrefetchOptions = {
  postCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetching: boolean;
  fetchNextPage: () => void;
  resetKey?: string;
  enabled?: boolean;
};

/**
 * Starts the next infinite-query page when the user scrolls past the prefetch
 * trigger index. Resets when the feed refreshes or a new page is appended.
 */
export function useFeedEarlyPrefetch({
  postCount,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
  fetchNextPage,
  resetKey,
  enabled = true,
}: UseFeedEarlyPrefetchOptions) {
  const prefetchTriggeredRef = useRef(false);
  const prevPostCountRef = useRef(postCount);

  useEffect(() => {
    prefetchTriggeredRef.current = false;
  }, [resetKey]);

  useEffect(() => {
    if (postCount !== prevPostCountRef.current) {
      prefetchTriggeredRef.current = false;
      prevPostCountRef.current = postCount;
    }
  }, [postCount]);

  const onMaxVisiblePostIndex = useCallback(
    (maxIndex: number) => {
      if (!enabled || maxIndex < 0) return;
      if (!hasNextPage || prefetchTriggeredRef.current) return;

      const triggerIndex = computePrefetchTriggerIndex(postCount);
      if (triggerIndex < 0 || maxIndex < triggerIndex) return;
      if (isFetchingNextPage || isFetching) return;

      prefetchTriggeredRef.current = true;
      fetchNextPage();
    },
    [
      enabled,
      postCount,
      hasNextPage,
      isFetchingNextPage,
      isFetching,
      fetchNextPage,
    ]
  );

  return { onMaxVisiblePostIndex };
}

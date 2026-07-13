import type { FeedPageResult } from "@/features/posts/api/fetchFeedPage";

/** Shared stale window for tab feeds — avoids mount refetch blocking scroll prefetch. */
export const FEED_INFINITE_STALE_MS = 5 * 60_000;

export const feedInfiniteGetNextPageParam = (
  lastPage: FeedPageResult
): string | undefined => (lastPage.hasMore ? lastPage.cursor ?? undefined : undefined);

export const FEED_INFINITE_QUERY_DEFAULTS = {
  staleTime: FEED_INFINITE_STALE_MS,
  refetchOnMount: false as const,
  initialPageParam: null as string | null,
  getNextPageParam: feedInfiniteGetNextPageParam,
};

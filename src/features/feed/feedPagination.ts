/** First infinite-query page — larger for instant scroll on open. */
export const FEED_INITIAL_PAGE_SIZE = 30;

/** Subsequent cursor pages. */
export const FEED_NEXT_PAGE_SIZE = 15;

/**
 * 0-based post index on the first batch (~14th–15th visible post).
 * Used as a floor when computing the dynamic prefetch trigger.
 */
export const FEED_PREFETCH_TRIGGER_INDEX = 13;

/** Posts before the end of the loaded window to start the next page fetch. */
export const FEED_PREFETCH_BUFFER = 2;

/** @deprecated Prefer FEED_NEXT_PAGE_SIZE */
export const FEED_PAGE_SIZE = FEED_NEXT_PAGE_SIZE;

export function resolveFeedPageLimit(cursor: string | null | undefined): number {
  return cursor == null ? FEED_INITIAL_PAGE_SIZE : FEED_NEXT_PAGE_SIZE;
}

/**
 * Post index at which the next feed page should be prefetched in the background.
 * Returns -1 when there is nothing to prefetch.
 */
export function computePrefetchTriggerIndex(postCount: number): number {
  if (postCount <= 0) return -1;
  if (postCount <= FEED_NEXT_PAGE_SIZE) {
    return Math.max(0, Math.floor(postCount / 2) - 1);
  }
  return Math.max(
    FEED_PREFETCH_TRIGGER_INDEX,
    postCount - FEED_NEXT_PAGE_SIZE - FEED_PREFETCH_BUFFER
  );
}

import { useEffect } from "react";
import { InteractionManager } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import {
  FEED_INFINITE_QUERY_DEFAULTS,
  feedInfiniteGetNextPageParam,
} from "@/features/feed/feedInfiniteQueryDefaults";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import type { UserMetadata } from "@/features/profile/types";
import {
  fetchFlowFeedPage,
  getFlowFeedFilterKey,
  getFlowFeedQueryKey,
  type FlowFeedVariant,
} from "./useFlowFeedInfinite";

export type UsePrefetchFlowFeedOptions = {
  variant: FlowFeedVariant;
  filters?: UserMetadata | null;
  authorId?: string;
  /** When false, prefetch is skipped entirely */
  enabled: boolean;
};

/**
 * Warms flow-feed cache after the screen settles.
 * Skips when cache already has data (no redundant network).
 */
export function usePrefetchFlowFeed({
  variant,
  filters = null,
  authorId,
  enabled,
}: UsePrefetchFlowFeedOptions) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((state) => state.version);
  const filterKey = getFlowFeedFilterKey(variant, filters, authorId);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (variant === "author" && !authorId) {
      return;
    }

    const queryKey = getFlowFeedQueryKey(variant, filterKey, feedVersion);

    if (queryClient.getQueryData(queryKey) !== undefined) {
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      if (queryClient.getQueryData(queryKey) !== undefined) {
        return;
      }

      void queryClient.prefetchInfiniteQuery({
        queryKey,
        queryFn: ({ pageParam, signal }) =>
          fetchFlowFeedPage(variant, pageParam as string | null, {
            filters,
            authorId,
            signal,
          }),
        ...FEED_INFINITE_QUERY_DEFAULTS,
        getNextPageParam: feedInfiniteGetNextPageParam,
      });
    });

    return () => {
      task.cancel();
    };
  }, [
    authorId,
    enabled,
    feedVersion,
    filterKey,
    filters,
    queryClient,
    variant,
  ]);
}

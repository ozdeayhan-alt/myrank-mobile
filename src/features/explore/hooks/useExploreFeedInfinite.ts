import { useCallback, useEffect, useMemo } from "react";
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { FeedApiContentType } from "@/features/feed/feedContentType";
import { resolveFeedPageLimit } from "@/features/feed/feedPagination";
import {
  FEED_INFINITE_QUERY_DEFAULTS,
  feedInfiniteGetNextPageParam,
} from "@/features/feed/feedInfiniteQueryDefaults";
import { useGuardedFeedFetchNextPage } from "@/features/feed/useGuardedFeedFetchNextPage";
import {
  fetchExploreFeedPage,
  type FeedPageResult,
} from "@/features/posts/api/fetchFeedPage";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import { patchPostInPages } from "@/features/posts/utils/patchPostInCache";
import type { PostCounts } from "@/features/ranking/types";
import { getFilterSegmentLabel } from "@/features/filters/utils/segmentLabel";
import type { UserMetadata } from "@/features/profile/types";
import { flattenFeedPages } from "@/features/explore/utils/flattenFeedPages";
import { invalidateServerFeedCache } from "@/features/posts/api/invalidateServerFeedCache";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

const EXPLORE_KEY = ["feed", "explore"] as const;

/** Busts stale persisted explore pages from pre-contentType sprint caches. */
const EXPLORE_FEED_CACHE_REVISION = "content-v2" as const;

export function useExploreFeedInfinite(
  filters: UserMetadata | null,
  contentType: FeedApiContentType = "all",
  enabled = true
) {
  const queryClient = useQueryClient();
  const filterKey = getFilterSegmentLabel(filters);
  const feedVersion = useFeedRefreshStore((s) => s.version);
  const queryKey = useMemo(
    () =>
      [
        ...EXPLORE_KEY,
        EXPLORE_FEED_CACHE_REVISION,
        filterKey,
        contentType,
        feedVersion,
      ] as const,
    [filterKey, contentType, feedVersion]
  );

  useEffect(() => {
    void queryClient.removeQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return (
          key[0] === EXPLORE_KEY[0] &&
          key[1] === EXPLORE_KEY[1] &&
          key[2] !== EXPLORE_FEED_CACHE_REVISION
        );
      },
    });
  }, [queryClient]);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      fetchExploreFeedPage(filters, pageParam as string | null, {
        limit: resolveFeedPageLimit(pageParam as string | null),
        contentType,
        signal,
      }),
    ...FEED_INFINITE_QUERY_DEFAULTS,
    getNextPageParam: feedInfiniteGetNextPageParam,
    enabled,
  });

  const posts = useMemo(() => flattenFeedPages(query.data), [query.data]);

  const loading = query.isLoading && !query.data;
  const error = query.error
    ? getUserFacingErrorMessage(query.error)
    : null;

  const refresh = useCallback(async () => {
    await invalidateServerFeedCache();
    await queryClient.invalidateQueries({ queryKey: [...EXPLORE_KEY] });
  }, [queryClient]);

  const fetchNextPage = useGuardedFeedFetchNextPage(query);

  const updatePostScore = useCallback(
    (postId: string, postScore: number, counts?: PostCounts) => {
      queryClient.setQueryData<InfiniteData<FeedPageResult>>(
        queryKey,
        (old) => patchPostInPages(old, postId, { postScore, counts })
      );
    },
    [queryClient, queryKey]
  );

  return {
    posts,
    loading,
    error,
    refresh,
    updatePostScore,
    filterKey,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetching: query.isFetching,
    fetchNextPage,
    isRefetching: query.isRefetching,
    engagementResetKey: `${filterKey}-${contentType}`,
  };
}

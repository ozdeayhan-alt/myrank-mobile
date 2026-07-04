import { useCallback, useMemo } from "react";
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
  fetchRecentFeedPage,
  type FeedPageResult,
} from "@/features/posts/api/fetchFeedPage";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import { patchPostInPages } from "@/features/posts/utils/patchPostInCache";
import type { PostCounts } from "@/features/ranking/types";
import { flattenFeedPages } from "@/features/explore/utils/flattenFeedPages";
import { invalidateServerFeedCache } from "@/features/posts/api/invalidateServerFeedCache";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

const HOME_RECENT_KEY = ["feed", "home", "recent"] as const;

export function useHomeFeedInfinite(
  contentType: FeedApiContentType = "all",
  enabled = true
) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);

  const recentQuery = useInfiniteQuery({
    queryKey: [...HOME_RECENT_KEY, contentType, feedVersion],
    queryFn: ({ pageParam, signal }) =>
      fetchRecentFeedPage(pageParam as string | null, {
        limit: resolveFeedPageLimit(pageParam as string | null),
        contentType,
        signal,
      }),
    ...FEED_INFINITE_QUERY_DEFAULTS,
    getNextPageParam: feedInfiniteGetNextPageParam,
    enabled,
  });

  const recentPosts = useMemo(
    () => flattenFeedPages(recentQuery.data),
    [recentQuery.data]
  );

  const loading = recentQuery.isLoading && !recentQuery.data;

  const error = useMemo(() => {
    const err = recentQuery.error;
    return err ? getUserFacingErrorMessage(err) : null;
  }, [recentQuery.error]);

  const refresh = useCallback(async () => {
    await invalidateServerFeedCache();
    await queryClient.invalidateQueries({ queryKey: [...HOME_RECENT_KEY] });
  }, [queryClient]);

  const fetchNextPage = useGuardedFeedFetchNextPage(recentQuery);

  const updatePostScore = useCallback(
    (postId: string, postScore: number, counts?: PostCounts) => {
      queryClient.setQueryData<InfiniteData<FeedPageResult>>(
        [...HOME_RECENT_KEY, contentType, feedVersion],
        (old) => patchPostInPages(old, postId, { postScore, counts })
      );
    },
    [queryClient, contentType, feedVersion]
  );

  return {
    recentPosts,
    loading,
    error,
    refresh,
    updatePostScore,
    hasNextPage: recentQuery.hasNextPage ?? false,
    isFetchingNextPage: recentQuery.isFetchingNextPage,
    isFetching: recentQuery.isFetching,
    fetchNextPage,
    isRefetching: recentQuery.isRefetching,
  };
}

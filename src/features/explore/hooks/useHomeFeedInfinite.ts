import { useCallback, useMemo } from "react";
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
const HOME_FEED_STALE_MS = 5 * 60_000;

export function useHomeFeedInfinite(enabled = true) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);

  const recentQuery = useInfiniteQuery({
    queryKey: [...HOME_RECENT_KEY, feedVersion],
    queryFn: ({ pageParam }) =>
      fetchRecentFeedPage(pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
    staleTime: HOME_FEED_STALE_MS,
    refetchOnMount: true,
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

  const fetchNextPage = () => {
    if (
      recentQuery.hasNextPage &&
      !recentQuery.isFetchingNextPage &&
      !recentQuery.isFetching
    ) {
      void recentQuery.fetchNextPage();
    }
  };

  const updatePostScore = useCallback(
    (postId: string, postScore: number, counts?: PostCounts) => {
      queryClient.setQueryData<InfiniteData<FeedPageResult>>(
        [...HOME_RECENT_KEY, feedVersion],
        (old) => patchPostInPages(old, postId, { postScore, counts })
      );
    },
    [queryClient, feedVersion]
  );

  return {
    recentPosts,
    loading,
    error,
    refresh,
    updatePostScore,
    hasNextPage: recentQuery.hasNextPage ?? false,
    isFetchingNextPage: recentQuery.isFetchingNextPage,
    fetchNextPage,
    isRefetching: recentQuery.isRefetching,
  };
}

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type InfiniteData,
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchRecentFeedPage,
  fetchTopFeedPage,
  type FeedPageResult,
} from "@/features/posts/api/fetchFeedPage";
import {
  HOME_TOP_POSTS_LIMIT,
} from "@/features/posts/constants";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import {
  patchPostScoreInList,
  patchPostScoreInPages,
} from "@/features/posts/utils/patchPostScoreInCache";
import { flattenFeedPages } from "@/features/explore/utils/flattenFeedPages";
import { invalidateServerFeedCache } from "@/features/posts/api/invalidateServerFeedCache";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

const HOME_RECENT_KEY = ["feed", "home", "recent"] as const;
const HOME_TOP_KEY = ["feed", "home", "top"] as const;

export function useHomeFeedInfinite(enabled = true) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);
  const [topEnabled, setTopEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setTopEnabled(false);
      return;
    }
    const timer = setTimeout(() => setTopEnabled(true), 400);
    return () => clearTimeout(timer);
  }, [enabled, feedVersion]);

  const topQuery = useQuery({
    queryKey: [...HOME_TOP_KEY, feedVersion],
    queryFn: () => fetchTopFeedPage(HOME_TOP_POSTS_LIMIT),
    staleTime: 60_000,
    enabled: enabled && topEnabled,
  });

  const recentQuery = useInfiniteQuery({
    queryKey: [...HOME_RECENT_KEY, feedVersion],
    queryFn: ({ pageParam }) =>
      fetchRecentFeedPage(pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
    staleTime: 60_000,
    enabled,
  });

  const recentPosts = useMemo(
    () => flattenFeedPages(recentQuery.data),
    [recentQuery.data]
  );

  const topPosts = topQuery.data?.posts ?? [];

  const loading = recentQuery.isLoading && !recentQuery.data;

  const error = useMemo(() => {
    const err = recentQuery.error ?? topQuery.error;
    return err ? getUserFacingErrorMessage(err) : null;
  }, [recentQuery.error, topQuery.error]);

  const refresh = useCallback(async () => {
    await invalidateServerFeedCache();
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [...HOME_RECENT_KEY] }),
      queryClient.invalidateQueries({ queryKey: [...HOME_TOP_KEY] }),
    ]);
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
    (postId: string, postScore: number) => {
      queryClient.setQueryData<InfiniteData<FeedPageResult>>(
        [...HOME_RECENT_KEY, feedVersion],
        (old) => patchPostScoreInPages(old, postId, postScore)
      );
      queryClient.setQueryData<FeedPageResult>(
        [...HOME_TOP_KEY, feedVersion],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            posts: patchPostScoreInList(old.posts, postId, postScore) ?? [],
          };
        }
      );
    },
    [queryClient, feedVersion]
  );

  return {
    recentPosts,
    topPosts,
    loading,
    error,
    refresh,
    updatePostScore,
    hasNextPage: recentQuery.hasNextPage ?? false,
    isFetchingNextPage: recentQuery.isFetchingNextPage,
    fetchNextPage,
    isRefetching: recentQuery.isRefetching || topQuery.isRefetching,
  };
}

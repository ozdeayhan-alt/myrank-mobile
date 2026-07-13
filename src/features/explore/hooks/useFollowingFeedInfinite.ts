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
  fetchFollowingFeedPage,
  type FeedPageResult,
} from "@/features/posts/api/fetchFeedPage";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import { patchPostInPages } from "@/features/posts/utils/patchPostInCache";
import type { PostCounts } from "@/features/ranking/types";
import { flattenFeedPages } from "@/features/explore/utils/flattenFeedPages";
import { invalidateServerFeedCache } from "@/features/posts/api/invalidateServerFeedCache";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

const HOME_FOLLOWING_KEY = ["feed", "home", "following"] as const;

export function useFollowingFeedInfinite(
  contentType: FeedApiContentType = "all",
  enabled = true
) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);

  const followingQuery = useInfiniteQuery({
    queryKey: [...HOME_FOLLOWING_KEY, contentType, feedVersion],
    queryFn: ({ pageParam, signal }) =>
      fetchFollowingFeedPage(pageParam as string | null, {
        limit: resolveFeedPageLimit(pageParam as string | null),
        contentType,
        signal,
      }),
    ...FEED_INFINITE_QUERY_DEFAULTS,
    getNextPageParam: feedInfiniteGetNextPageParam,
    enabled,
  });

  const posts = useMemo(
    () => flattenFeedPages(followingQuery.data),
    [followingQuery.data]
  );

  const loading =
    followingQuery.isLoading && !followingQuery.data;

  const error = useMemo(() => {
    const err = followingQuery.error;
    return err ? getUserFacingErrorMessage(err) : null;
  }, [followingQuery.error]);

  const refresh = useCallback(async () => {
    void invalidateServerFeedCache();
    await queryClient.invalidateQueries({ queryKey: [...HOME_FOLLOWING_KEY] });
  }, [queryClient]);

  const fetchNextPage = useGuardedFeedFetchNextPage(followingQuery);

  const updatePostScore = useCallback(
    (postId: string, postScore: number, counts?: PostCounts) => {
      queryClient.setQueryData<InfiniteData<FeedPageResult>>(
        [...HOME_FOLLOWING_KEY, contentType, feedVersion],
        (old) => patchPostInPages(old, postId, { postScore, counts })
      );
    },
    [queryClient, contentType, feedVersion]
  );

  return {
    posts,
    loading,
    error,
    refresh,
    updatePostScore,
    hasNextPage: followingQuery.hasNextPage ?? false,
    isFetchingNextPage: followingQuery.isFetchingNextPage,
    isFetching: followingQuery.isFetching,
    fetchNextPage,
    isRefetching: followingQuery.isRefetching,
  };
}

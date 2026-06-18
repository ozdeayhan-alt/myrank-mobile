import { useCallback, useMemo } from "react";
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

export function useFollowingFeedInfinite(enabled = true) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);

  const followingQuery = useInfiniteQuery({
    queryKey: [...HOME_FOLLOWING_KEY, feedVersion],
    queryFn: ({ pageParam }) =>
      fetchFollowingFeedPage(pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
    staleTime: 60_000,
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
    await invalidateServerFeedCache();
    await queryClient.invalidateQueries({ queryKey: [...HOME_FOLLOWING_KEY] });
  }, [queryClient]);

  const fetchNextPage = () => {
    if (
      followingQuery.hasNextPage &&
      !followingQuery.isFetchingNextPage &&
      !followingQuery.isFetching
    ) {
      void followingQuery.fetchNextPage();
    }
  };

  const updatePostScore = useCallback(
    (postId: string, postScore: number, counts?: PostCounts) => {
      queryClient.setQueryData<InfiniteData<FeedPageResult>>(
        [...HOME_FOLLOWING_KEY, feedVersion],
        (old) => patchPostInPages(old, postId, { postScore, counts })
      );
    },
    [queryClient, feedVersion]
  );

  return {
    posts,
    loading,
    error,
    refresh,
    updatePostScore,
    hasNextPage: followingQuery.hasNextPage ?? false,
    isFetchingNextPage: followingQuery.isFetchingNextPage,
    fetchNextPage,
    isRefetching: followingQuery.isRefetching,
  };
}

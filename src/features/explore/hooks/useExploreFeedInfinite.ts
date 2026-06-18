import { useCallback, useMemo } from "react";
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

export function useExploreFeedInfinite(
  filters: UserMetadata | null,
  enabled = true
) {
  const queryClient = useQueryClient();
  const filterKey = getFilterSegmentLabel(filters);
  const feedVersion = useFeedRefreshStore((s) => s.version);
  const queryKey = useMemo(
    () => [...EXPLORE_KEY, filterKey, feedVersion] as const,
    [filterKey, feedVersion]
  );

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchExploreFeedPage(filters, pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
    staleTime: 60_000,
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

  const fetchNextPage = () => {
    if (query.hasNextPage && !query.isFetchingNextPage && !query.isFetching) {
      void query.fetchNextPage();
    }
  };

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
    fetchNextPage,
    isRefetching: query.isRefetching,
    engagementResetKey: filterKey,
  };
}

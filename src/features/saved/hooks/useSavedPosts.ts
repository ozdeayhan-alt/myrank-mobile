import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { flattenFeedPages } from "@/features/explore/utils/flattenFeedPages";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { fetchSavedPostsPage } from "../api/fetchSavedPosts";

export const savedPostsQueryKey = (userId: string) =>
  ["savedPosts", userId] as const;

const SAVED_FEED_STALE_MS = 60_000;

export function useSavedPosts(userId: string | undefined) {
  const query = useInfiniteQuery({
    queryKey: savedPostsQueryKey(userId ?? ""),
    queryFn: ({ pageParam }) =>
      fetchSavedPostsPage(pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
    enabled: Boolean(userId),
    staleTime: SAVED_FEED_STALE_MS,
  });

  const posts = useMemo(
    () => flattenFeedPages(query.data),
    [query.data]
  );

  const loading = query.isLoading && !query.data;
  const error = useMemo(
    () => (query.error ? getUserFacingErrorMessage(query.error) : null),
    [query.error]
  );

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const fetchNextPage = useCallback(() => {
    if (
      query.hasNextPage &&
      !query.isFetchingNextPage &&
      !query.isFetching
    ) {
      void query.fetchNextPage();
    }
  }, [query]);

  return {
    posts,
    loading,
    error,
    refresh,
    isRefetching: query.isRefetching,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage,
  };
}

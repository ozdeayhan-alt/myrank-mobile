import { useCallback } from "react";

type FeedQueryPagination = {
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  isFetching: boolean;
  fetchNextPage: () => Promise<unknown>;
};

export function useGuardedFeedFetchNextPage(query: FeedQueryPagination) {
  return useCallback(() => {
    if (
      query.hasNextPage &&
      !query.isFetchingNextPage &&
      !query.isFetching
    ) {
      void query.fetchNextPage();
    }
  }, [
    query.fetchNextPage,
    query.hasNextPage,
    query.isFetching,
    query.isFetchingNextPage,
  ]);
}

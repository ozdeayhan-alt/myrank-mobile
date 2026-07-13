import { useCallback, useMemo } from "react";
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { resolveFeedPageLimit } from "@/features/feed/feedPagination";
import {
  FEED_INFINITE_QUERY_DEFAULTS,
  feedInfiniteGetNextPageParam,
} from "@/features/feed/feedInfiniteQueryDefaults";
import { useGuardedFeedFetchNextPage } from "@/features/feed/useGuardedFeedFetchNextPage";
import { flattenFeedPages } from "@/features/explore/utils/flattenFeedPages";
import {
  fetchExploreFeedPage,
  fetchFollowingFeedPage,
  fetchRecentFeedPage,
  type FeedPageResult,
} from "@/features/posts/api/fetchFeedPage";
import { fetchPostsByAuthorPage } from "@/features/posts/api/fetchPostsByAuthor";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import { patchPostInPages } from "@/features/posts/utils/patchPostInCache";
import type { PostCounts } from "@/features/ranking/types";
import { getFilterSegmentLabel } from "@/features/filters/utils/segmentLabel";
import type { UserMetadata } from "@/features/profile/types";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { isFlowPost } from "../utils/isFlowPost";

export type FlowFeedVariant = "home" | "explore" | "following" | "author";

type UseFlowFeedInfiniteOptions = {
  variant: FlowFeedVariant;
  filters?: UserMetadata | null;
  authorId?: string;
  enabled?: boolean;
};

export const FLOW_FEED_KEY = ["flow-feed"] as const;

export function getFlowFeedFilterKey(
  variant: FlowFeedVariant,
  filters?: UserMetadata | null,
  authorId?: string
): string {
  if (variant === "explore") {
    return getFilterSegmentLabel(filters);
  }
  if (variant === "author") {
    return authorId ?? "";
  }
  return variant;
}

export function getFlowFeedQueryKey(
  variant: FlowFeedVariant,
  filterKey: string,
  feedVersion: number
) {
  return [...FLOW_FEED_KEY, variant, filterKey, feedVersion] as const;
}

export function fetchFlowFeedPage(
  variant: FlowFeedVariant,
  cursor: string | null,
  options: {
    filters?: UserMetadata | null;
    authorId?: string;
    signal?: AbortSignal;
  }
): Promise<FeedPageResult> {
  const limit = resolveFeedPageLimit(cursor);
  const contentType = "flow" as const;

  if (variant === "home") {
    return fetchRecentFeedPage(cursor, { limit, contentType, signal: options.signal });
  }

  if (variant === "following") {
    return fetchFollowingFeedPage(cursor, { limit, contentType, signal: options.signal });
  }

  if (variant === "author") {
    if (!options.authorId) {
      return Promise.resolve({ posts: [], cursor: null, hasMore: false });
    }
    return fetchPostsByAuthorPage(
      options.authorId,
      cursor,
      contentType,
      options.signal
    );
  }

  return fetchExploreFeedPage(options.filters ?? null, cursor, {
    limit,
    contentType,
    signal: options.signal,
  });
}

export function useFlowFeedInfinite({
  variant,
  filters = null,
  authorId,
  enabled = true,
}: UseFlowFeedInfiniteOptions) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);
  const filterKey = getFlowFeedFilterKey(variant, filters, authorId);

  const queryKey = useMemo(
    () => getFlowFeedQueryKey(variant, filterKey, feedVersion),
    [variant, filterKey, feedVersion]
  );

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      fetchFlowFeedPage(variant, pageParam as string | null, {
        filters,
        authorId,
        signal,
      }),
    ...FEED_INFINITE_QUERY_DEFAULTS,
    getNextPageParam: feedInfiniteGetNextPageParam,
    enabled: enabled && (variant !== "author" || Boolean(authorId)),
  });

  const posts = useMemo(() => {
    const flattened = flattenFeedPages(query.data);
    return flattened.filter(isFlowPost);
  }, [query.data]);

  const updatePostScore = useCallback(
    (postId: string, postScore: number, counts?: PostCounts) => {
      queryClient.setQueryData<InfiniteData<FeedPageResult>>(queryKey, (old) =>
        patchPostInPages(old, postId, { postScore, counts })
      );
    },
    [queryClient, queryKey]
  );

  const fetchNextPage = useGuardedFeedFetchNextPage(query);

  return {
    posts,
    loading: query.isLoading && query.data === undefined,
    error: query.error ? getUserFacingErrorMessage(query.error) : null,
    refresh: query.refetch,
    isRefetching: query.isRefetching,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetching: query.isFetching,
    fetchNextPage,
    updatePostScore,
  };
}

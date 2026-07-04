import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { FeedApiContentType } from "@/features/feed/feedContentType";
import {
  FEED_INFINITE_QUERY_DEFAULTS,
  feedInfiniteGetNextPageParam,
} from "@/features/feed/feedInfiniteQueryDefaults";
import { useGuardedFeedFetchNextPage } from "@/features/feed/useGuardedFeedFetchNextPage";
import { fetchPostsByAuthorPage } from "@/features/posts/api/fetchPostsByAuthor";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

export const authorPostsQueryKey = (
  authorId: string,
  contentType: FeedApiContentType,
  feedVersion: number
) => ["profilePosts", authorId, contentType, feedVersion] as const;

type AuthorPostsPage = Awaited<ReturnType<typeof fetchPostsByAuthorPage>>;

export function useAuthorPosts(
  authorId: string,
  contentType: FeedApiContentType = "all",
  enabled = true
) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);

  const queryKey = authorPostsQueryKey(authorId, contentType, feedVersion);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) =>
      fetchPostsByAuthorPage(
        authorId,
        pageParam as string | null,
        contentType,
        signal
      ),
    ...FEED_INFINITE_QUERY_DEFAULTS,
    getNextPageParam: feedInfiniteGetNextPageParam,
    enabled: enabled && Boolean(authorId),
  });

  const posts = query.data?.pages.flatMap((page) => page.posts) ?? [];

  const removePost = (postId: string) => {
    queryClient.setQueryData<InfiniteData<AuthorPostsPage>>(queryKey, (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((post) => post.id !== postId),
        })),
      };
    });
  };

  const updatePostContent = (postId: string, content: string) => {
    queryClient.setQueryData<InfiniteData<AuthorPostsPage>>(queryKey, (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map((page) => ({
          ...page,
          posts: page.posts.map((post) =>
            post.id === postId ? { ...post, content } : post
          ),
        })),
      };
    });
  };

  const fetchNextPage = useGuardedFeedFetchNextPage(query);

  return {
    posts,
    loading: query.isLoading && query.data === undefined,
    error: query.error ? getUserFacingErrorMessage(query.error) : null,
    refresh: query.refetch,
    isRefetching: query.isRefetching,
    removePost,
    updatePostContent,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetching: query.isFetching,
    fetchNextPage,
  };
}

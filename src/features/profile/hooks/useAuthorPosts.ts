import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchPostsByAuthorPage } from "@/features/posts/api/fetchPostsByAuthor";
import { useFeedRefreshStore } from "@/features/posts/store/useFeedRefreshStore";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

export const authorPostsQueryKey = (authorId: string, feedVersion: number) =>
  ["profilePosts", authorId, feedVersion] as const;

type AuthorPostsPage = Awaited<ReturnType<typeof fetchPostsByAuthorPage>>;

export function useAuthorPosts(authorId: string) {
  const queryClient = useQueryClient();
  const feedVersion = useFeedRefreshStore((s) => s.version);

  const queryKey = authorPostsQueryKey(authorId, feedVersion);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchPostsByAuthorPage(authorId, pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
    enabled: Boolean(authorId),
    staleTime: 60_000,
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

  const fetchNextPage = () => {
    if (query.hasNextPage && !query.isFetchingNextPage && !query.isFetching) {
      void query.fetchNextPage();
    }
  };

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
    fetchNextPage,
  };
}

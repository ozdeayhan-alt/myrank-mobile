import { useScrollToTop } from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import { useCallback, useMemo, useRef } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { useAuth } from "@/features/auth";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { fetchPostsByHashtagPage } from "@/features/posts/api/fetchPostsByHashtagPage";
import type { HashtagPostsPage } from "@/features/posts/api/fetchPostsByHashtagPage";
import { filterVideoPosts } from "@/features/posts/utils/videoPosts";
import { normalizeHashtag } from "@/features/posts/utils/parsePostContent";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

export default function HashtagScreen() {
  const { user } = useAuth();
  const { tag: rawTag } = useLocalSearchParams<{ tag: string }>();
  const tag = normalizeHashtag(rawTag ?? "");
  const listRef = useRef<FlashListRef<FeedListItem>>(null);
  useScrollToTop(listRef);
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["feed", "hashtag", tag] as const, [tag]);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      fetchPostsByHashtagPage(tag, pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.cursor : undefined,
    enabled: tag.length > 0,
    staleTime: 60_000,
  });

  const posts = useMemo(
    () => query.data?.pages.flatMap((page) => page.posts) ?? [],
    [query.data]
  );

  const feedItems = useMemo(
    (): FeedListItem[] =>
      posts.map((post) => ({
        kind: "post" as const,
        key: post.id,
        post,
      })),
    [posts]
  );

  const videoPosts = useMemo(() => filterVideoPosts(posts), [posts]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const updatePostScore = useCallback(
    (postId: string, postScore: number) => {
      queryClient.setQueryData<InfiniteData<HashtagPostsPage>>(
        queryKey,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) =>
                post.id === postId ? { ...post, postScore } : post
              ),
            })),
          };
        }
      );
    },
    [queryClient, queryKey]
  );

  const loading = query.isLoading && !query.data;
  const error = query.error
    ? getUserFacingErrorMessage(query.error)
    : null;

  return (
    <TabScreenSafeArea className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: `#${tag}`,
          headerBackTitle: "Geri",
        }}
      />

      <FeedFlashList
        listRef={listRef}
        items={feedItems}
        videoPosts={videoPosts}
        loading={loading}
        error={error}
        emptyMessage={`#${tag} için henüz gönderi yok.`}
        onRefresh={() => void refresh()}
        onScoreUpdate={updatePostScore}
        hasNextPage={query.hasNextPage ?? false}
        isFetchingNextPage={query.isFetchingNextPage}
        onLoadMore={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) {
            void query.fetchNextPage();
          }
        }}
        isRefetching={query.isRefetching}
        engagementResetKey={tag}
        currentUserId={user?.uid ?? null}
      />
    </TabScreenSafeArea>
  );
}

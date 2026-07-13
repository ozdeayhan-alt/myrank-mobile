import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  InteractionManager,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
  type ViewToken,
} from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import type { UserMetadata } from "@/features/profile/types";
import { useIncrementalEngagement } from "@/features/ranking/hooks/useIncrementalEngagement";
import { PostInteractionProvider } from "../context/PostInteractionContext";
import {
  DEFAULT_LIST_HORIZONTAL_INSET,
  type PostFeedMediaLayoutOptions,
} from "../constants/feedMediaLayout";
import type { Post } from "../types";
import {
  prefetchFeedPostsImagesBatch,
  prefetchPostMedia,
} from "../utils/prefetchPostMedia";
import { isFeedRenderIsolationEnabled } from "@/lib/featureFlags/feedFlags";
import { getFeedSlotItemType } from "@/features/feed/resolveFeedSlotLayout";
import { computeMaxVisiblePostIndex } from "@/features/feed/computeMaxVisiblePostIndex";
import { useFeedEarlyPrefetch } from "@/features/feed/useFeedEarlyPrefetch";
import { FeedVisiblePostsProvider } from "../context/FeedVisiblePostsContext";
import { FeedPostErrorBoundary } from "./FeedPostErrorBoundary";
import { FeedPostSkeleton } from "./FeedPostSkeleton";
import { FeedPostRow } from "./FeedPostRow";
import { FeedStreamRow } from "./FeedStreamRow";
import { FeedInteractionHost } from "./FeedInteractionHost";
import { FlowInlineGrid } from "@/features/flow/components/FlowInlineGrid";
import { collectPostIdsFromMixedFeedItems } from "@/features/flow/utils/groupPostsForMixedFeed";

const FEED_DRAW_DISTANCE = 1400;
const FEED_STREAM_DRAW_DISTANCE_MULTIPLIER = 1.9;
const PREFETCH_AHEAD_COUNT = 6;
const PREFETCH_BEHIND_COUNT = 2;
const INITIAL_PREFETCH_COUNT = 24;
const INITIAL_PREFETCH_DEFERRED_COUNT = 6;
const VISIBLE_IDS_DEBOUNCE_MS = 120;
const SCROLL_PREFETCH_DEBOUNCE_MS = 150;

export type FeedListItem =
  | {
      kind: "header";
      key: string;
      title: string;
      subtitle?: string;
    }
  | {
      kind: "placeholder";
      key: string;
      variant: "loading" | "error" | "empty";
      message: string;
    }
  | {
      kind: "post";
      key: string;
      post: Post;
    }
  | {
      kind: "flow_grid";
      key: string;
      posts: Post[];
    };

type FeedFlashListProps = PostFeedMediaLayoutOptions & {
  items: FeedListItem[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  onRefresh: () => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  ListHeaderComponent?: React.ReactElement | null;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  /** Loaded post IDs for pagination prefetch (unfiltered); defaults to visible items. */
  paginationPostIds?: readonly string[];
  isFetching?: boolean;
  engagementResetKey?: string;
  isRefetching?: boolean;
  listRef?: RefObject<FlashListRef<FeedListItem> | null>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  extraData?: unknown;
  listKey?: string;
  currentUserId?: string | null;
  exploreFilters?: UserMetadata | null;
  streamCell?: boolean;
  /** Tab odakta değilken prefetch kapalı — arka planda JS yükünü azaltır. */
  prefetchEnabled?: boolean;
};

const viewabilityConfig = {
  itemVisiblePercentThreshold: 35,
  minimumViewTime: 80,
};

type FeedPostListItemProps = PostFeedMediaLayoutOptions & {
  post: Post;
  patchEngagement: (
    postId: string,
    patch: Partial<import("@/features/ranking/types").EngagementStatus>
  ) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  currentUserId?: string | null;
  streamCell?: boolean;
};

function FeedPostListItem({
  post,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
  currentUserId,
  streamCell = false,
  listHorizontalInset,
  mediaEdgeBleed,
}: FeedPostListItemProps) {
  if (streamCell) {
    return (
      <FeedPostErrorBoundary post={post}>
        <FeedStreamRow
          post={post}
          patchEngagement={patchEngagement}
          onScoreUpdate={onScoreUpdate}
          currentUserId={currentUserId}
          listHorizontalInset={listHorizontalInset}
          mediaEdgeBleed={mediaEdgeBleed}
        />
      </FeedPostErrorBoundary>
    );
  }

  return (
    <FeedPostErrorBoundary post={post}>
      <FeedPostRow
        post={post}
        patchEngagement={patchEngagement}
        onScoreUpdate={onScoreUpdate}
        onPostDeleted={onPostDeleted}
        onPostContentUpdated={onPostContentUpdated}
        currentUserId={currentUserId}
        listHorizontalInset={listHorizontalInset}
        mediaEdgeBleed={mediaEdgeBleed}
      />
    </FeedPostErrorBoundary>
  );
}

export function FeedFlashList({
  items,
  loading,
  error,
  emptyMessage,
  onRefresh,
  onScoreUpdate,
  ListHeaderComponent,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  paginationPostIds,
  isFetching = false,
  engagementResetKey,
  isRefetching = false,
  listRef,
  contentContainerStyle,
  onPostDeleted,
  onPostContentUpdated,
  extraData,
  listKey,
  currentUserId = null,
  listHorizontalInset,
  mediaEdgeBleed,
  streamCell = false,
  prefetchEnabled = true,
}: FeedFlashListProps) {
  const { height: screenHeight } = useWindowDimensions();
  const renderIsolation = isFeedRenderIsolationEnabled();
  const visibleIdsDebounceMs = renderIsolation ? VISIBLE_IDS_DEBOUNCE_MS : 0;
  const scrollPrefetchDebounceMs = renderIsolation ? SCROLL_PREFETCH_DEBOUNCE_MS : 0;
  const drawDistance = streamCell
    ? Math.round(screenHeight * FEED_STREAM_DRAW_DISTANCE_MULTIPLIER)
    : FEED_DRAW_DISTANCE;
  const [visiblePostIds, setVisiblePostIds] = useState<Set<string>>(
    () => new Set()
  );
  const visiblePostIdsRef = useRef<Set<string>>(new Set());
  const visibleIdsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const prefetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchEnabledRef = useRef(prefetchEnabled);
  prefetchEnabledRef.current = prefetchEnabled;
  const prefetchAroundVisiblePostsRef = useRef<
    (visibleIds: Set<string>) => void
  >(() => {});
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const postIds = useMemo(
    () => collectPostIdsFromMixedFeedItems(items),
    [items]
  );
  const postIdsRef = useRef(postIds);
  postIdsRef.current = postIds;

  const paginationIds = paginationPostIds ?? postIds;
  const paginationIdsRef = useRef(paginationIds);
  paginationIdsRef.current = paginationIds;

  const { onMaxVisiblePostIndex } = useFeedEarlyPrefetch({
    postCount: paginationIds.length,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage: onLoadMore ?? (() => {}),
    resetKey: engagementResetKey,
    enabled: Boolean(onLoadMore) && prefetchEnabled,
  });
  const onMaxVisiblePostIndexRef = useRef(onMaxVisiblePostIndex);
  onMaxVisiblePostIndexRef.current = onMaxVisiblePostIndex;

  const engagementFetchEnabled = !loading || postIds.length > 0;

  useEffect(() => {
    const batch: Post[] = [];
    for (const item of items) {
      if (item.kind === "post") {
        batch.push(item.post);
      } else if (item.kind === "flow_grid") {
        batch.push(...item.posts);
      }
      if (batch.length >= (streamCell ? INITIAL_PREFETCH_DEFERRED_COUNT : 8)) {
        break;
      }
    }

    const prefetchCount = streamCell
      ? INITIAL_PREFETCH_DEFERRED_COUNT
      : Math.min(INITIAL_PREFETCH_COUNT, 8);
    const prefetchBatch = batch.slice(0, prefetchCount);

    if (prefetchBatch.length === 0 || !prefetchEnabledRef.current) {
      return;
    }

    const task = InteractionManager.runAfterInteractions(() => {
      if (!prefetchEnabledRef.current) {
        return;
      }

      if (streamCell) {
        prefetchFeedPostsImagesBatch(prefetchBatch);
        return;
      }

      for (const post of prefetchBatch) {
        prefetchPostMedia(post);
      }
    });

    return () => {
      task.cancel();
    };
  }, [items, streamCell, prefetchEnabled]);

  const { patchEngagement } = useIncrementalEngagement(
    postIds,
    engagementResetKey,
    engagementFetchEnabled
  );

  const prefetchAroundVisiblePosts = useCallback((visibleIds: Set<string>) => {
    if (!prefetchEnabledRef.current) {
      return;
    }

    const listItems = itemsRef.current;

    const visibleIndexes: number[] = [];
    for (let index = 0; index < listItems.length; index += 1) {
      const item = listItems[index];
      if (item.kind === "post" && visibleIds.has(item.post.id)) {
        visibleIndexes.push(index);
      } else if (
        item.kind === "flow_grid" &&
        item.posts.some((post) => visibleIds.has(post.id))
      ) {
        visibleIndexes.push(index);
      }
    }

    if (visibleIndexes.length === 0) {
      return;
    }

    const minVisible = Math.min(...visibleIndexes);
    const maxVisible = Math.max(...visibleIndexes);
    const aheadCount = streamCell ? PREFETCH_AHEAD_COUNT : 8;
    const behindCount = streamCell ? PREFETCH_BEHIND_COUNT : 2;

    const toPrefetch: Post[] = [];

    const collectPosts = (item: FeedListItem): Post[] => {
      if (item.kind === "post") {
        return [item.post];
      }
      if (item.kind === "flow_grid") {
        return item.posts;
      }
      return [];
    };

    for (const index of visibleIndexes) {
      toPrefetch.push(...collectPosts(listItems[index]));
    }

    for (let offset = 1; offset <= aheadCount; offset += 1) {
      const upcoming = listItems[maxVisible + offset];
      if (upcoming) {
        toPrefetch.push(...collectPosts(upcoming));
      }
    }

    for (let offset = 1; offset <= behindCount; offset += 1) {
      const previous = listItems[minVisible - offset];
      if (previous) {
        toPrefetch.push(...collectPosts(previous));
      }
    }

    if (streamCell) {
      prefetchFeedPostsImagesBatch(toPrefetch);
      return;
    }

    for (const post of toPrefetch) {
      prefetchPostMedia(post);
    }
  }, [streamCell]);

  prefetchAroundVisiblePostsRef.current = prefetchAroundVisiblePosts;

  useEffect(() => {
    return () => {
      if (visibleIdsDebounceRef.current) {
        clearTimeout(visibleIdsDebounceRef.current);
      }
      if (prefetchDebounceRef.current) {
        clearTimeout(prefetchDebounceRef.current);
      }
    };
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FeedListItem>[] }) => {
      const nextVisible = new Set<string>();

      for (const token of viewableItems) {
        const item = token.item;
        if (item?.kind === "post") {
          nextVisible.add(item.post.id);
        } else if (item?.kind === "flow_grid") {
          for (const post of item.posts) {
            nextVisible.add(post.id);
          }
        }
      }

      visiblePostIdsRef.current = nextVisible;

      if (visibleIdsDebounceRef.current) {
        clearTimeout(visibleIdsDebounceRef.current);
      }
      visibleIdsDebounceRef.current = setTimeout(() => {
        visibleIdsDebounceRef.current = null;
        setVisiblePostIds((previous) => {
          const next = visiblePostIdsRef.current;
          if (
            previous.size === next.size &&
            [...next].every((id) => previous.has(id))
          ) {
            return previous;
          }
          return new Set(next);
        });
      }, visibleIdsDebounceMs);

      if (nextVisible.size > 0) {
        const maxPostIndex = computeMaxVisiblePostIndex(
          nextVisible,
          paginationIdsRef.current
        );
        onMaxVisiblePostIndexRef.current(maxPostIndex);

        if (prefetchDebounceRef.current) {
          clearTimeout(prefetchDebounceRef.current);
        }
        prefetchDebounceRef.current = setTimeout(() => {
          prefetchDebounceRef.current = null;
          prefetchAroundVisiblePostsRef.current(visiblePostIdsRef.current);
        }, scrollPrefetchDebounceMs);
      }
    }
  ).current;

  const getItemType = useCallback(
    (item: FeedListItem) => {
      if (!streamCell || item.kind !== "post") {
        return item.kind;
      }

      return getFeedSlotItemType(item.post);
    },
    [streamCell]
  );

  const listExtraData = extraData;

  const renderItem = useCallback(
    ({ item }: { item: FeedListItem }) => {
      if (item.kind === "placeholder") {
        if (item.variant === "loading") {
          return <FeedPostSkeleton count={2} />;
        }
        if (item.variant === "error") {
          return (
            <View className="mb-6 rounded-xl bg-red-50 px-4 py-3">
              <Text className="text-sm text-red-700">{item.message}</Text>
            </View>
          );
        }
        return (
          <Text className="py-12 text-center text-gray-500">{item.message}</Text>
        );
      }

      if (item.kind === "header") {
        return (
          <View className="mb-3 mt-6 px-0">
            <Text className="text-base font-semibold tracking-tight text-gray-900">
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text className="mt-0.5 text-xs leading-4 text-gray-400">
                {item.subtitle}
              </Text>
            ) : null}
          </View>
        );
      }

      if (item.kind === "flow_grid") {
        return (
          <FlowInlineGrid
            posts={item.posts}
            horizontalPadding={listHorizontalInset ?? DEFAULT_LIST_HORIZONTAL_INSET}
          />
        );
      }

      return (
        <FeedPostListItem
          post={item.post}
          patchEngagement={patchEngagement}
          onScoreUpdate={onScoreUpdate}
          onPostDeleted={onPostDeleted}
          onPostContentUpdated={onPostContentUpdated}
          currentUserId={currentUserId}
          streamCell={streamCell}
          listHorizontalInset={listHorizontalInset}
          mediaEdgeBleed={mediaEdgeBleed}
        />
      );
    },
    [
      patchEngagement,
      onScoreUpdate,
      onPostDeleted,
      onPostContentUpdated,
      currentUserId,
      streamCell,
      listHorizontalInset,
      mediaEdgeBleed,
    ]
  );

  const listContentStyle = useMemo(
    () =>
      contentContainerStyle ?? {
        paddingHorizontal: listHorizontalInset,
        paddingVertical: 16,
      },
    [contentContainerStyle, listHorizontalInset]
  );

  const listEmpty = useMemo(() => {
    if (loading) {
      return <FeedPostSkeleton count={3} />;
    }
    if (error) {
      return (
        <View className="mb-6 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      );
    }
    return (
      <Text className="py-12 text-center text-gray-500">{emptyMessage}</Text>
    );
  }, [loading, error, emptyMessage]);

  const listFooter = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return <FeedPostSkeleton count={1} />;
  }, [isFetchingNextPage]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && onLoadMore) {
      onLoadMore();
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  const hasPostItems = useMemo(
    () => items.some((item) => item.kind === "post"),
    [items]
  );

  const showRefreshing = isRefetching && hasPostItems;

  return (
    <PostInteractionProvider currentUserId={currentUserId}>
      <FeedVisiblePostsProvider visiblePostIds={visiblePostIds}>
        <FlashList
          key={listKey}
          ref={listRef}
          data={items}
          extraData={listExtraData}
          renderItem={renderItem}
          keyExtractor={(item: FeedListItem) => item.key}
          getItemType={getItemType}
          style={{ flex: 1, backgroundColor: streamCell ? "#ffffff" : undefined }}
          contentContainerStyle={listContentStyle}
          ListHeaderComponent={ListHeaderComponent ?? undefined}
          ListEmptyComponent={!hasPostItems && items.length === 0 ? listEmpty : undefined}
          ListFooterComponent={listFooter ?? undefined}
          refreshing={showRefreshing}
          onRefresh={onRefresh}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.4}
          drawDistance={drawDistance}
          keyboardDismissMode="on-drag"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          {...(streamCell
            ? {
                overrideProps: {
                  initialDrawBatchSize: 12,
                },
              }
            : {})}
        />
        {streamCell ? (
          <FeedInteractionHost
            currentUserId={currentUserId}
            patchEngagement={patchEngagement}
            onScoreUpdate={onScoreUpdate}
            onPostDeleted={onPostDeleted}
            onPostContentUpdated={onPostContentUpdated}
          />
        ) : null}
      </FeedVisiblePostsProvider>
    </PostInteractionProvider>
  );
}

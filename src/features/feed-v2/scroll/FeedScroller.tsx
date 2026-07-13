import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
} from "react";
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
import { PostInteractionProvider } from "@/features/posts/context/PostInteractionContext";
import { DEFAULT_LIST_HORIZONTAL_INSET } from "@/features/posts/constants/feedMediaLayout";
import { estimateFeedStreamRowHeight } from "@/features/posts/utils/feedStreamLayout";
import {
  resetFeedScrollVisibilityStore,
  updateFeedVisibleDuelKeys,
  updateFeedVisiblePostIds,
  useIsFeedDuelVisible,
} from "@/features/posts/store/feedScrollVisibilityStore";
import type { Post } from "@/features/posts/types";
import {
  prefetchFeedPostsImagesBatch,
} from "@/features/posts/utils/prefetchPostMedia";
import { isFeedRenderIsolationEnabled } from "@/lib/featureFlags/feedFlags";
import { computeMaxVisiblePostIndex } from "@/features/feed/computeMaxVisiblePostIndex";
import { useFeedEarlyPrefetch } from "@/features/feed/useFeedEarlyPrefetch";
import { FeedPostSkeleton } from "@/features/posts/components/FeedPostSkeleton";
import type { FeedV2ListItem } from "../engine/FeedEngine.types";
import { WhispRow } from "../renderers/whisp/WhispRow";
import { GlowRow } from "../renderers/glow/GlowRow";
import { RepostRow } from "../renderers/RepostRow";
import { DuelFeedCard } from "@/features/duel/components/DuelFeedCard";
import { FlowInlineGrid } from "@/features/flow/components/FlowInlineGrid";
import { collectPostIdsFromMixedFeedItems } from "@/features/flow/utils/groupPostsForMixedFeed";

const FEED_STREAM_DRAW_DISTANCE_MULTIPLIER = 1.9;
const PREFETCH_AHEAD_COUNT = 6;
const PREFETCH_BEHIND_COUNT = 2;
const INITIAL_PREFETCH_DEFERRED_COUNT = 6;
const VISIBLE_IDS_DEBOUNCE_MS = 120;
const SCROLL_PREFETCH_DEBOUNCE_MS = 150;

const viewabilityConfig = {
  itemVisiblePercentThreshold: 35,
  minimumViewTime: 80,
};

export type FeedScrollerProps = {
  items: FeedV2ListItem[];
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
  listRef?: RefObject<FlashListRef<FeedV2ListItem> | null>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  listKey?: string;
  currentUserId?: string | null;
  exploreFilters?: UserMetadata | null;
  prefetchEnabled?: boolean;
};

function getItemType(item: FeedV2ListItem): string {
  return item.kind;
}

function FeedDuelRow({ cardKey }: { cardKey: string }) {
  const visible = useIsFeedDuelVisible(cardKey);
  return <DuelFeedCard cardKey={cardKey} visible={visible} />;
}

export function FeedScroller({
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
  listKey,
  currentUserId = null,
  prefetchEnabled = true,
}: FeedScrollerProps) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const renderIsolation = isFeedRenderIsolationEnabled();
  const visibleIdsDebounceMs = renderIsolation ? VISIBLE_IDS_DEBOUNCE_MS : 0;
  const drawDistance = Math.round(screenHeight * FEED_STREAM_DRAW_DISTANCE_MULTIPLIER);
  const horizontalInset = DEFAULT_LIST_HORIZONTAL_INSET;
  const streamContainerWidth = Math.max(0, screenWidth - horizontalInset * 2);

  const visiblePostIdsRef = useRef<Set<string>>(new Set());
  const visibleIdsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchEnabledRef = useRef(prefetchEnabled);
  prefetchEnabledRef.current = prefetchEnabled;
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
  const { patchEngagement } = useIncrementalEngagement(
    postIds,
    engagementResetKey,
    engagementFetchEnabled
  );

  const initialPrefetchKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const batch: Post[] = [];
    for (const item of items) {
      if (item.kind === "duel") {
        continue;
      }
      if (item.kind === "flow_grid") {
        batch.push(...item.posts);
      } else {
        batch.push(item.post);
      }
      if (batch.length >= INITIAL_PREFETCH_DEFERRED_COUNT) {
        break;
      }
    }
    if (batch.length === 0 || !prefetchEnabledRef.current) return;

    const prefetchKey = batch.map((post) => post.id).join(",");
    if (initialPrefetchKeyRef.current === prefetchKey) {
      return;
    }
    initialPrefetchKeyRef.current = prefetchKey;

    const task = InteractionManager.runAfterInteractions(() => {
      if (!prefetchEnabledRef.current) return;
      prefetchFeedPostsImagesBatch(batch);
    });

    return () => task.cancel();
  }, [items]);

  const prefetchAroundVisiblePosts = useCallback((visibleIds: Set<string>) => {
    if (!prefetchEnabledRef.current) return;

    const postItems = itemsRef.current;
    const visibleIndexes: number[] = [];
    for (let index = 0; index < postItems.length; index += 1) {
      const row = postItems[index];
      if (row.kind === "duel") {
        continue;
      }
      if (row.kind === "flow_grid") {
        if (row.posts.some((post) => visibleIds.has(post.id))) {
          visibleIndexes.push(index);
        }
        continue;
      }
      if (visibleIds.has(row.post.id)) {
        visibleIndexes.push(index);
      }
    }
    if (visibleIndexes.length === 0) return;

    const minVisible = Math.min(...visibleIndexes);
    const maxVisible = Math.max(...visibleIndexes);
    const toPrefetch: Post[] = [];

    const collectPosts = (item: FeedV2ListItem): Post[] => {
      if (item.kind === "duel") {
        return [];
      }
      if (item.kind === "flow_grid") {
        return item.posts;
      }
      return [item.post];
    };

    for (let offset = 1; offset <= PREFETCH_AHEAD_COUNT; offset += 1) {
      const upcoming = postItems[maxVisible + offset];
      if (upcoming) {
        toPrefetch.push(...collectPosts(upcoming));
      }
    }
    for (let offset = 1; offset <= PREFETCH_BEHIND_COUNT; offset += 1) {
      const previous = postItems[minVisible - offset];
      if (previous) {
        toPrefetch.push(...collectPosts(previous));
      }
    }

    prefetchFeedPostsImagesBatch(toPrefetch);
  }, []);

  const prefetchAroundVisiblePostsRef = useRef(prefetchAroundVisiblePosts);
  prefetchAroundVisiblePostsRef.current = prefetchAroundVisiblePosts;

  useEffect(() => {
    return () => {
      if (visibleIdsDebounceRef.current) clearTimeout(visibleIdsDebounceRef.current);
      if (prefetchDebounceRef.current) clearTimeout(prefetchDebounceRef.current);
      resetFeedScrollVisibilityStore();
    };
  }, []);

  const visibleDuelKeysRef = useRef<ReadonlySet<string>>(new Set());

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FeedV2ListItem>[] }) => {
      const nextVisible = new Set<string>();
      const nextVisibleDuels = new Set<string>();
      for (const token of viewableItems) {
        if (!token.item) continue;
        if (token.item.kind === "duel") {
          nextVisibleDuels.add(token.item.key);
          continue;
        }
        if (token.item.kind === "flow_grid") {
          for (const post of token.item.posts) {
            nextVisible.add(post.id);
          }
          continue;
        }
        nextVisible.add(token.item.post.id);
      }
      visiblePostIdsRef.current = nextVisible;

      const prevDuels = visibleDuelKeysRef.current;
      let duelChanged = prevDuels.size !== nextVisibleDuels.size;
      if (!duelChanged) {
        for (const key of nextVisibleDuels) {
          if (!prevDuels.has(key)) {
            duelChanged = true;
            break;
          }
        }
      }
      if (duelChanged) {
        visibleDuelKeysRef.current = nextVisibleDuels;
        updateFeedVisibleDuelKeys(nextVisibleDuels);
      }

      if (visibleIdsDebounceRef.current) clearTimeout(visibleIdsDebounceRef.current);
      visibleIdsDebounceRef.current = setTimeout(() => {
        visibleIdsDebounceRef.current = null;
        updateFeedVisiblePostIds(visiblePostIdsRef.current);
      }, visibleIdsDebounceMs);

      if (nextVisible.size > 0) {
        const maxPostIndex = computeMaxVisiblePostIndex(
          nextVisible,
          paginationIdsRef.current
        );
        onMaxVisiblePostIndexRef.current(maxPostIndex);

        if (prefetchDebounceRef.current) clearTimeout(prefetchDebounceRef.current);
        prefetchDebounceRef.current = setTimeout(() => {
          prefetchDebounceRef.current = null;
          prefetchAroundVisiblePostsRef.current(visiblePostIdsRef.current);
        }, SCROLL_PREFETCH_DEBOUNCE_MS);
      }
    }
  ).current;

  const renderItem = useCallback(
    ({ item }: { item: FeedV2ListItem }) => {
      if (item.kind === "duel") {
        return <FeedDuelRow cardKey={item.key} />;
      }

      if (item.kind === "flow_grid") {
        return <FlowInlineGrid posts={item.posts} horizontalPadding={horizontalInset} />;
      }

      const rowProps = {
        post: item.post,
        patchEngagement,
        onScoreUpdate,
        onPostDeleted,
        onPostContentUpdated,
        currentUserId,
      };

      const row = (() => {
        switch (item.kind) {
          case "whisp":
            return <WhispRow {...rowProps} />;
          case "glow":
            return <GlowRow {...rowProps} />;
          case "repost":
            return <RepostRow {...rowProps} />;
          default:
            return <WhispRow {...rowProps} />;
        }
      })();

      // Whisp: doğal yükseklik — minHeight fazla boşluk bırakıyordu.
      if (item.kind === "whisp") {
        return row;
      }

      const estimatedRowHeight = estimateFeedStreamRowHeight(
        item.post,
        streamContainerWidth
      );
      return <View style={{ minHeight: estimatedRowHeight }}>{row}</View>;
    },
    [
      currentUserId,
      onPostContentUpdated,
      onPostDeleted,
      onScoreUpdate,
      patchEngagement,
      streamContainerWidth,
      horizontalInset,
    ]
  );

  const listContentStyle = useMemo(
    () =>
      contentContainerStyle ?? {
        paddingHorizontal: horizontalInset,
        paddingVertical: 16,
      },
    [contentContainerStyle, horizontalInset]
  );

  const hasPostItems = items.length > 0;
  const showRefreshing = isRefetching && hasPostItems;

  const listEmpty = useMemo(() => {
    if (loading) return <FeedPostSkeleton count={3} />;
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

  return (
    <PostInteractionProvider currentUserId={currentUserId}>
      <FlashList
        key={listKey}
        ref={listRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        getItemType={getItemType}
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        contentContainerStyle={listContentStyle}
        ListHeaderComponent={ListHeaderComponent ?? undefined}
        ListEmptyComponent={!hasPostItems ? listEmpty : undefined}
        ListFooterComponent={listFooter ?? undefined}
        refreshing={showRefreshing}
        onRefresh={onRefresh}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        drawDistance={drawDistance}
        keyboardDismissMode="on-drag"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        overrideProps={{ initialDrawBatchSize: 12 }}
      />
    </PostInteractionProvider>
  );
}

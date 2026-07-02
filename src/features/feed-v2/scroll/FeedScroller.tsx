import {
  memo,
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
  updateFeedVisiblePostIds,
} from "@/features/posts/store/feedScrollVisibilityStore";
import type { Post } from "@/features/posts/types";
import {
  prefetchFeedPostsImagesBatch,
} from "@/features/posts/utils/prefetchPostMedia";
import { isFeedRenderIsolationEnabled } from "@/lib/featureFlags/feedFlags";
import { FeedPostSkeleton } from "@/features/posts/components/FeedPostSkeleton";
import type { FeedV2ListItem } from "../engine/FeedEngine.types";
import { openFlow } from "../renderers/flow/FlowNavigator";
import { findVideoPostForOpen } from "@/features/posts/utils/videoPosts";
import type { ReelsPlaylistSource } from "@/features/posts/store/useReelsNavigationStore";
import { WhispRow } from "../renderers/whisp/WhispRow";
import { GlowRow } from "../renderers/glow/GlowRow";
import { FlowTeaserRow } from "../renderers/flow/FlowTeaserRow";
import { RepostRow } from "../renderers/RepostRow";

const FEED_DRAW_DISTANCE = 1400;
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
  videoPosts: Post[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  onRefresh: () => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  ListHeaderComponent?: React.ReactElement | null;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  engagementResetKey?: string;
  isRefetching?: boolean;
  listRef?: RefObject<FlashListRef<FeedV2ListItem> | null>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  listKey?: string;
  currentUserId?: string | null;
  reelsSource?: ReelsPlaylistSource;
  reelsAuthorId?: string;
  exploreFilters?: UserMetadata | null;
  prefetchEnabled?: boolean;
};

function getItemType(item: FeedV2ListItem): string {
  return item.kind;
}

export function FeedScroller({
  items,
  videoPosts,
  loading,
  error,
  emptyMessage,
  onRefresh,
  onScoreUpdate,
  ListHeaderComponent,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  engagementResetKey,
  isRefetching = false,
  listRef,
  contentContainerStyle,
  onPostDeleted,
  onPostContentUpdated,
  listKey,
  currentUserId = null,
  reelsSource = "home",
  reelsAuthorId,
  exploreFilters,
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
    () => items.map((item) => item.post.id),
    [items]
  );

  const playlist = useMemo(
    () =>
      videoPosts.length > 0
        ? videoPosts
        : items
            .filter((item) => item.kind === "flow-teaser")
            .map((item) => item.post),
    [items, videoPosts]
  );

  const engagementFetchEnabled = !loading || postIds.length > 0;
  const { patchEngagement } = useIncrementalEngagement(
    postIds,
    engagementResetKey,
    engagementFetchEnabled
  );

  useEffect(() => {
    const batch = items.slice(0, INITIAL_PREFETCH_DEFERRED_COUNT).map((i) => i.post);
    if (batch.length === 0 || !prefetchEnabledRef.current) return;

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
      if (visibleIds.has(postItems[index].post.id)) {
        visibleIndexes.push(index);
      }
    }
    if (visibleIndexes.length === 0) return;

    const minVisible = Math.min(...visibleIndexes);
    const maxVisible = Math.max(...visibleIndexes);
    const toPrefetch: Post[] = [];

    for (const index of visibleIndexes) {
      toPrefetch.push(postItems[index].post);
    }
    for (let offset = 1; offset <= PREFETCH_AHEAD_COUNT; offset += 1) {
      const upcoming = postItems[maxVisible + offset];
      if (upcoming) toPrefetch.push(upcoming.post);
    }
    for (let offset = 1; offset <= PREFETCH_BEHIND_COUNT; offset += 1) {
      const previous = postItems[minVisible - offset];
      if (previous) toPrefetch.push(previous.post);
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

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FeedV2ListItem>[] }) => {
      const nextVisible = new Set<string>();
      for (const token of viewableItems) {
        if (token.item) {
          nextVisible.add(token.item.post.id);
        }
      }
      visiblePostIdsRef.current = nextVisible;

      if (visibleIdsDebounceRef.current) clearTimeout(visibleIdsDebounceRef.current);
      visibleIdsDebounceRef.current = setTimeout(() => {
        visibleIdsDebounceRef.current = null;
        updateFeedVisiblePostIds(visiblePostIdsRef.current);
      }, visibleIdsDebounceMs);

      if (nextVisible.size > 0) {
        if (prefetchDebounceRef.current) clearTimeout(prefetchDebounceRef.current);
        prefetchDebounceRef.current = setTimeout(() => {
          prefetchDebounceRef.current = null;
          prefetchAroundVisiblePostsRef.current(visiblePostIdsRef.current);
        }, SCROLL_PREFETCH_DEBOUNCE_MS);
      }
    }
  ).current;

  const feedPosts = useMemo(() => items.map((item) => item.post), [items]);

  const handleOpenFlow = useCallback(
    (postId: string) => {
      const anchorPost = findVideoPostForOpen(feedPosts, postId);
      openFlow(postId, playlist, anchorPost, {
        source: reelsSource,
        ...(reelsAuthorId ? { authorId: reelsAuthorId } : {}),
        ...(reelsSource === "explore" ? { exploreFilters: exploreFilters ?? null } : {}),
      });
    },
    [exploreFilters, feedPosts, playlist, reelsAuthorId, reelsSource]
  );

  const renderItem = useCallback(
    ({ item }: { item: FeedV2ListItem }) => {
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
          case "flow-teaser":
            return (
              <FlowTeaserRow {...rowProps} onOpenFlow={handleOpenFlow} />
            );
          case "repost":
            return (
              <RepostRow {...rowProps} onOpenFlow={handleOpenFlow} />
            );
          default:
            return <WhispRow {...rowProps} />;
        }
      })();

      // Whisp: içerik yüksekliğine göre ölçülür. Glow/Flow/Repost: sabit slot.
      if (item.kind === "whisp") {
        return <View collapsable={false}>{row}</View>;
      }

      const estimatedRowHeight = estimateFeedStreamRowHeight(
        item.post,
        streamContainerWidth
      );
      return <View style={{ minHeight: estimatedRowHeight }}>{row}</View>;
    },
    [
      currentUserId,
      handleOpenFlow,
      onPostContentUpdated,
      onPostDeleted,
      onScoreUpdate,
      patchEngagement,
      streamContainerWidth,
    ]
  );

  const listContentStyle = useMemo(
    () =>
      contentContainerStyle ?? {
        paddingHorizontal: 16,
        paddingVertical: 16,
      },
    [contentContainerStyle]
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

import { useCallback, useMemo, useRef, useState, type RefObject } from "react";
import {
  Text,
  View,
  type StyleProp,
  type ViewStyle,
  type ViewToken,
} from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useIncrementalEngagement } from "@/features/ranking/hooks/useIncrementalEngagement";
import { isFeedInlineAutoplayEnabled } from "@/lib/feedInlineAutoplayEnabled";
import { PostInteractionProvider } from "../context/PostInteractionContext";
import type { Post } from "../types";
import { prefetchPostMedia } from "../utils/prefetchPostMedia";
import { FeedPostErrorBoundary } from "./FeedPostErrorBoundary";
import { FeedPostSkeleton } from "./FeedPostSkeleton";
import { FeedPostRow } from "./FeedPostRow";
import { VideoReelsViewer } from "./VideoReelsViewer";
import { filterVideoPosts, isVideoPost } from "../utils/videoPosts";

const FEED_DRAW_DISTANCE = 500;
/** Görünür satırın önündeki medya (video manifest/segment dahil) ısıtma adedi */
const PREFETCH_AHEAD_COUNT = 5;

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
    };

type FeedFlashListProps = {
  items: FeedListItem[];
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
  listRef?: RefObject<FlashListRef<FeedListItem> | null>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  extraData?: unknown;
  listKey?: string;
  currentUserId?: string | null;
};

const viewabilityConfig = {
  itemVisiblePercentThreshold: 35,
  minimumViewTime: 80,
};

export function FeedFlashList({
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
  extraData,
  listKey,
  currentUserId = null,
}: FeedFlashListProps) {
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const [autoplayPostId, setAutoplayPostId] = useState<string | null>(null);
  const autoplayPostIdRef = useRef<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const inlineAutoplayEnabled = isFeedInlineAutoplayEnabled();

  const postIds = useMemo(
    () =>
      items
        .filter(
          (item): item is Extract<FeedListItem, { kind: "post" }> =>
            item.kind === "post"
        )
        .map((item) => item.post.id),
    [items]
  );

  const playlist = useMemo(
    () =>
      videoPosts.length > 0
        ? videoPosts
        : filterVideoPosts(
            items
              .filter(
                (item): item is Extract<FeedListItem, { kind: "post" }> =>
                  item.kind === "post"
              )
              .map((item) => item.post)
          ),
    [items, videoPosts]
  );

  const { getEngagement, patchEngagement } = useIncrementalEngagement(
    postIds,
    engagementResetKey
  );

  const prefetchUpcomingPosts = useCallback((visiblePostIds: Set<string>) => {
    const postItems = itemsRef.current.filter(
      (item): item is Extract<FeedListItem, { kind: "post" }> =>
        item.kind === "post"
    );

    let maxVisibleIndex = -1;
    for (let index = 0; index < postItems.length; index += 1) {
      if (visiblePostIds.has(postItems[index].post.id)) {
        maxVisibleIndex = index;
      }
    }

    if (maxVisibleIndex < 0) {
      return;
    }

    for (
      let offset = 1;
      offset <= PREFETCH_AHEAD_COUNT;
      offset += 1
    ) {
      const upcoming = postItems[maxVisibleIndex + offset];
      if (upcoming) {
        prefetchPostMedia(upcoming.post);
      }
    }
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<FeedListItem>[] }) => {
      const nextVisible = new Set<string>();
      let nextAutoplayPostId: string | null = null;

      for (const token of viewableItems) {
        const item = token.item;
        if (item?.kind === "post") {
          nextVisible.add(item.post.id);
          if (
            inlineAutoplayEnabled &&
            !nextAutoplayPostId &&
            isVideoPost(item.post) &&
            (token.isViewable ?? true)
          ) {
            nextAutoplayPostId = item.post.id;
          }
        }
      }

      if (nextAutoplayPostId !== autoplayPostIdRef.current) {
        autoplayPostIdRef.current = nextAutoplayPostId;
        setAutoplayPostId(nextAutoplayPostId);
      }

      if (nextVisible.size > 0) {
        prefetchUpcomingPosts(nextVisible);
      }
    }
  ).current;

  const handlePatch = useCallback(
    (postId: string, patch: Parameters<typeof patchEngagement>[1]) => {
      patchEngagement(postId, patch);
    },
    [patchEngagement]
  );

  const getItemType = useCallback((item: FeedListItem) => item.kind, []);

  const listExtraData = useMemo(
    () => ({ autoplayPostId, extraData }),
    [autoplayPostId, extraData]
  );

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

      return (
        <FeedPostErrorBoundary post={item.post}>
          <FeedPostRow
            post={item.post}
            patchEngagement={patchEngagement}
            onScoreUpdate={onScoreUpdate}
            onOpenVideo={setOpenVideoId}
            onPostDeleted={onPostDeleted}
            onPostContentUpdated={onPostContentUpdated}
            currentUserId={currentUserId}
            inlineAutoplay={
              inlineAutoplayEnabled && autoplayPostId === item.post.id
            }
          />
        </FeedPostErrorBoundary>
      );
    },
    [
      patchEngagement,
      onScoreUpdate,
      onPostDeleted,
      onPostContentUpdated,
      currentUserId,
      autoplayPostId,
      inlineAutoplayEnabled,
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
      <FlashList
        key={listKey}
        ref={listRef}
        data={items}
        extraData={listExtraData}
        renderItem={renderItem}
        keyExtractor={(item: FeedListItem) => item.key}
        getItemType={getItemType}
        style={{ flex: 1 }}
        contentContainerStyle={listContentStyle}
        ListHeaderComponent={ListHeaderComponent ?? undefined}
        ListEmptyComponent={!hasPostItems && items.length === 0 ? listEmpty : undefined}
        ListFooterComponent={listFooter ?? undefined}
        refreshing={showRefreshing}
        onRefresh={onRefresh}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        drawDistance={FEED_DRAW_DISTANCE}
        keyboardDismissMode="on-drag"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {openVideoId && playlist.length > 0 ? (
        <VideoReelsViewer
          visible
          videoPosts={playlist}
          initialPostId={openVideoId}
          onClose={() => setOpenVideoId(null)}
          onScoreUpdate={onScoreUpdate}
          getEngagement={getEngagement}
          patchEngagement={handlePatch}
        />
      ) : null}
    </PostInteractionProvider>
  );
}

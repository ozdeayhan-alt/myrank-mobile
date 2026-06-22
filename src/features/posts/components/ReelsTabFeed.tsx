import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { HomeFeedMode } from "@/components/HomeFeedModeToggle";
import { useTabBarContentInset } from "@/hooks/useTabBarContentInset";
import { useIncrementalEngagement } from "@/features/ranking/hooks/useIncrementalEngagement";
import { PostInteractionProvider } from "../context/PostInteractionContext";
import { CONTENT_TYPE_LABELS } from "../constants/contentTypeLabels";
import { useReelsFeedInfinite } from "../hooks/useReelsFeedInfinite";
import { useReelsNavigationStore } from "../store/useReelsNavigationStore";
import type { Post } from "../types";
import { indexOfVideoPost } from "../utils/videoPosts";
import { useReelsActiveIndexStore } from "../store/useReelsActiveIndexStore";
import { ReelRow } from "./ReelRow";

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 55,
  minimumViewTime: 0,
};

function mergeSeedPosts(seedPosts: Post[] | null, feedPosts: Post[]): Post[] {
  if (!seedPosts || seedPosts.length === 0) {
    return feedPosts;
  }

  const seen = new Set<string>();
  const merged: Post[] = [];

  for (const post of seedPosts) {
    if (seen.has(post.id)) {
      continue;
    }
    seen.add(post.id);
    merged.push(post);
  }

  for (const post of feedPosts) {
    if (seen.has(post.id)) {
      continue;
    }
    seen.add(post.id);
    merged.push(post);
  }

  return merged;
}

type ReelsTabFeedProps = {
  currentUserId?: string | null;
  feedMode?: HomeFeedMode;
  fullscreen?: boolean;
};

export function ReelsTabFeed({
  currentUserId = null,
  feedMode = "global",
  fullscreen = false,
}: ReelsTabFeedProps) {
  const { width, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { bottom: tabBarInset, tabBarHeight } = useTabBarContentInset();
  const reelHeight = Math.max(
    320,
    fullscreen
      ? windowHeight - insets.top
      : windowHeight - tabBarHeight - insets.top
  );

  const listRef = useRef<FlashListRef<Post>>(null);
  const [screenFocused, setScreenFocused] = useState(true);
  const activeIndexRef = useRef(0);
  const setActiveIndex = useReelsActiveIndexStore((s) => s.setActiveIndex);
  const resetActiveIndex = useReelsActiveIndexStore((s) => s.resetActiveIndex);

  const targetPostId = useReelsNavigationStore((s) => s.targetPostId);
  const seedPosts = useReelsNavigationStore((s) => s.seedPosts);
  const clearNavigation = useReelsNavigationStore((s) => s.clearNavigation);

  const {
    videoPosts: feedVideoPosts,
    loading,
    error,
    refresh,
    updatePostScore,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isRefetching,
    engagementResetKey,
  } = useReelsFeedInfinite(screenFocused, feedMode);

  const videoPosts = useMemo(
    () => mergeSeedPosts(seedPosts, feedVideoPosts),
    [seedPosts, feedVideoPosts]
  );

  const postIds = useMemo(() => videoPosts.map((post) => post.id), [videoPosts]);
  useIncrementalEngagement(postIds, engagementResetKey);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => {
        setScreenFocused(false);
        resetActiveIndex();
      };
    }, [resetActiveIndex])
  );

  useEffect(() => {
    if (!targetPostId || videoPosts.length === 0) {
      return;
    }

    const index = indexOfVideoPost(videoPosts, targetPostId);
    if (index < 0) {
      clearNavigation();
      return;
    }

    activeIndexRef.current = index;
    setActiveIndex(index);

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const attemptScroll = (attempt: number) => {
      if (cancelled) {
        return;
      }

      listRef.current?.scrollToIndex({ index, animated: false });

      if (attempt >= 5) {
        clearNavigation();
      }
    };

    attemptScroll(0);
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      timeouts.push(setTimeout(() => attemptScroll(attempt), 50 * attempt));
    }

    return () => {
      cancelled = true;
      for (const timeoutId of timeouts) {
        clearTimeout(timeoutId);
      }
    };
  }, [targetPostId, videoPosts, clearNavigation, setActiveIndex]);

  const initialScrollIndex = useMemo(() => {
    if (!targetPostId) {
      return undefined;
    }

    const index = indexOfVideoPost(videoPosts, targetPostId);
    return index >= 0 ? index : undefined;
  }, [targetPostId, videoPosts]);

  const setActiveIndexFromOffset = useCallback(
    (offsetY: number) => {
      if (videoPosts.length === 0 || reelHeight <= 0) {
        return;
      }

      const progress = offsetY / reelHeight;
      const predictedIndex = Math.round(progress);
      const clamped = Math.max(
        0,
        Math.min(predictedIndex, videoPosts.length - 1)
      );

      if (clamped !== activeIndexRef.current) {
        activeIndexRef.current = clamped;
        setActiveIndex(clamped);
      }
    },
    [reelHeight, setActiveIndex, videoPosts.length]
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveIndexFromOffset(event.nativeEvent.contentOffset.y);
    },
    [setActiveIndexFromOffset]
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Post>[] }) => {
      const setIndex = useReelsActiveIndexStore.getState().setActiveIndex;
      const primary = viewableItems.find(
        (token) => token.isViewable && token.index != null
      );

      if (primary?.index != null && primary.index !== activeIndexRef.current) {
        activeIndexRef.current = primary.index;
        setIndex(primary.index);
      }
    }
  ).current;

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveIndexFromOffset(event.nativeEvent.contentOffset.y);
    },
    [setActiveIndexFromOffset]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <ReelRow
        post={item}
        index={index}
        enabled={screenFocused}
        width={width}
        height={reelHeight}
        onScoreUpdate={updatePostScore}
        overlayBottomInset={fullscreen ? tabBarInset : insets.bottom}
      />
    ),
    [
      fullscreen,
      insets.bottom,
      reelHeight,
      screenFocused,
      tabBarInset,
      updatePostScore,
      width,
    ]
  );

  const listEmpty = useMemo(() => {
    if (loading) {
      return (
        <View
          style={{ width, height: reelHeight }}
          className="items-center justify-center bg-black"
        >
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      );
    }

    if (error) {
      return (
        <View
          style={{ width, height: reelHeight }}
          className="items-center justify-center bg-black px-6"
        >
          <Text className="text-center text-sm text-white/80">{error}</Text>
        </View>
      );
    }

    return (
      <View
        style={{ width, height: reelHeight }}
        className="items-center justify-center bg-black px-6"
      >
        <Text className="text-center text-sm text-white/80">
          Henüz {CONTENT_TYPE_LABELS.video} yok.
        </Text>
      </View>
    );
  }, [error, loading, reelHeight, width]);

  const listFooter = useMemo(() => {
    if (!isFetchingNextPage) {
      return null;
    }
    return (
      <View
        style={{ width, height: reelHeight }}
        className="items-center justify-center bg-black"
      >
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }, [isFetchingNextPage, reelHeight, width]);

  return (
    <PostInteractionProvider currentUserId={currentUserId}>
      <View
        className="flex-1 bg-black"
        style={fullscreen ? undefined : { paddingTop: insets.top }}
      >
        <FlashList
          ref={listRef}
          data={videoPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          initialScrollIndex={initialScrollIndex}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={reelHeight}
          snapToAlignment="start"
          disableIntervalMomentum
          drawDistance={reelHeight * 2}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.6}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          refreshing={isRefetching && videoPosts.length > 0}
          onRefresh={() => {
            void refresh();
          }}
        />
      </View>
    </PostInteractionProvider>
  );
}

import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { HomeFeedMode } from "@/components/HomeFeedModeToggle";
import { useTabBarContentInset } from "@/hooks/useTabBarContentInset";
import { useExploreFeedInfinite } from "@/features/explore/hooks/useExploreFeedInfinite";
import { getFilterSegmentLabel } from "@/features/filters/utils/segmentLabel";
import type { UserMetadata } from "@/features/profile/types";
import { useIncrementalEngagement } from "@/features/ranking/hooks/useIncrementalEngagement";
import { useAuthorPosts } from "@/features/profile/hooks/useAuthorPosts";
import { PostInteractionProvider } from "@/features/posts/context/PostInteractionContext";
import { CONTENT_TYPE_LABELS } from "@/features/posts/constants/contentTypeLabels";
import { useReelsFeedInfinite } from "@/features/posts/hooks/useReelsFeedInfinite";
import { useReelsNavigationStore } from "@/features/posts/store/useReelsNavigationStore";
import type { Post } from "@/features/posts/types";
import {
  collectVideoPostsForPlaylist,
  indexOfVideoPost,
} from "@/features/posts/utils/videoPosts";
import { useReelsActiveIndexStore } from "@/features/posts/store/useReelsActiveIndexStore";
import { useFlowSessionStore } from "./FlowSession";
import { FlowRowSurface } from "./FlowRowSurface";
import { PlayerPoolProvider } from "./player/PlayerPool";
import { isFeedV2PlayerPoolEnabled } from "@/lib/featureFlags/feedFlags";
import { ReelRow } from "@/features/posts/components/ReelRow";
import { devFlowLog } from "@/lib/devLog";

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 55,
  minimumViewTime: 0,
};

const TARGET_SCROLL_LOCK_MAX_MS = 450;
const TARGET_SCROLL_OFFSET_TOLERANCE_PX = 12;
const MAX_VIDEO_BACKFILL_PAGES = 20;

function appendUniqueFeedPosts(seedPosts: Post[], feedPosts: Post[]): Post[] {
  const seen = new Set<string>();
  const merged: Post[] = [];

  for (const post of seedPosts) {
    if (seen.has(post.id)) continue;
    seen.add(post.id);
    merged.push(post);
  }

  for (const post of feedPosts) {
    if (seen.has(post.id)) continue;
    seen.add(post.id);
    merged.push(post);
  }

  return merged;
}

export type FlowPagerProps = {
  currentUserId?: string | null;
  feedMode?: HomeFeedMode;
  fullscreen?: boolean;
  homeSeedPosts?: Post[];
  exploreBrowse?: boolean;
  exploreFilters?: UserMetadata | null;
  exploreSeedPosts?: Post[];
  profileBrowse?: boolean;
  profileAuthorId?: string;
  profileSeedPosts?: Post[];
};

export function FlowPager({
  currentUserId = null,
  feedMode = "global",
  fullscreen = false,
  homeSeedPosts,
  exploreBrowse = false,
  exploreFilters: exploreFiltersProp,
  exploreSeedPosts,
  profileBrowse = false,
  profileAuthorId,
  profileSeedPosts,
}: FlowPagerProps) {
  const { width, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { bottom: tabBarInset, tabBarHeight } = useTabBarContentInset();
  const reelHeight = Math.max(
    320,
    fullscreen ? windowHeight : windowHeight - tabBarHeight - insets.top
  );

  const listRef = useRef<FlashListRef<Post>>(null);
  const [screenFocused, setScreenFocused] = useState(true);
  const activeIndexRef = useRef(0);
  const activeIndexChangeSourceRef = useRef<"scroll" | "viewability" | "init">("init");
  const navigationScrollLockRef = useRef<number | null>(null);
  const activeIndex = useReelsActiveIndexStore((s) => s.activeIndex);
  const prevActiveIndexLogRef = useRef(activeIndex);
  const setActiveIndex = useReelsActiveIndexStore((s) => s.setActiveIndex);
  const resetActiveIndex = useReelsActiveIndexStore((s) => s.resetActiveIndex);
  const usePlayerPool = isFeedV2PlayerPoolEnabled();

  const flowTargetPostId = useFlowSessionStore((s) => s.targetPostId);
  const flowSeedPosts = useFlowSessionStore((s) => s.seedPosts);
  const flowSource = useFlowSessionStore((s) => s.source);
  const flowAuthorId = useFlowSessionStore((s) => s.authorId);
  const flowExploreFilters = useFlowSessionStore((s) => s.exploreFilters);
  const clearFlowScrollTarget = useFlowSessionStore((s) => s.clearScrollTarget);

  const targetPostId = useReelsNavigationStore((s) => s.targetPostId) ?? flowTargetPostId;
  const seedPosts = useReelsNavigationStore((s) => s.seedPosts) ?? flowSeedPosts;
  const playlistSource = useReelsNavigationStore((s) => s.playlistSource) ?? flowSource;
  const authorId = useReelsNavigationStore((s) => s.authorId) ?? flowAuthorId;
  const navExploreFilters = useReelsNavigationStore((s) => s.exploreFilters) ?? flowExploreFilters;
  const clearScrollTarget = useReelsNavigationStore((s) => s.clearScrollTarget);

  const isProfilePlaylist =
    (profileBrowse && Boolean(profileAuthorId)) ||
    (playlistSource === "profile" && Boolean(authorId));
  const resolvedAuthorId = profileBrowse
    ? (profileAuthorId ?? "")
    : (authorId ?? "");
  const isExplorePlaylist = exploreBrowse || playlistSource === "explore";
  const resolvedExploreFilters = exploreBrowse
    ? (exploreFiltersProp ?? null)
    : navExploreFilters;
  const useHomeFeed = !isProfilePlaylist && !isExplorePlaylist;

  const {
    videoPosts: feedVideoPosts,
    loading: feedLoading,
    error: feedError,
    refresh: feedRefresh,
    updatePostScore: feedUpdatePostScore,
    hasNextPage: feedHasNextPage,
    isFetchingNextPage: feedIsFetchingNextPage,
    fetchNextPage: feedFetchNextPage,
    isRefetching: feedIsRefetching,
    engagementResetKey: feedEngagementResetKey,
  } = useReelsFeedInfinite(screenFocused && useHomeFeed, feedMode);

  const {
    posts: explorePosts,
    loading: exploreLoading,
    error: exploreError,
    refresh: exploreRefresh,
    updatePostScore: exploreUpdatePostScore,
    hasNextPage: exploreHasNextPage,
    isFetchingNextPage: exploreIsFetchingNextPage,
    fetchNextPage: exploreFetchNextPage,
    isRefetching: exploreIsRefetching,
  } = useExploreFeedInfinite(
    resolvedExploreFilters,
    screenFocused && isExplorePlaylist
  );

  const exploreVideoPosts = useMemo(
    () => collectVideoPostsForPlaylist(explorePosts),
    [explorePosts]
  );

  const {
    posts: authorPosts,
    loading: authorLoading,
    error: authorError,
    refresh: authorRefresh,
    hasNextPage: authorHasNextPage,
    isFetchingNextPage: authorIsFetchingNextPage,
    fetchNextPage: authorFetchNextPage,
    isRefetching: authorIsRefetching,
  } = useAuthorPosts(
    resolvedAuthorId,
    screenFocused && isProfilePlaylist
  );

  const authorVideoPosts = useMemo(
    () => collectVideoPostsForPlaylist(authorPosts),
    [authorPosts]
  );

  const videoPosts = useMemo(() => {
    if (isProfilePlaylist) {
      const profileSeeds = [...(profileSeedPosts ?? []), ...(seedPosts ?? [])];
      if (profileSeeds.length > 0) {
        return appendUniqueFeedPosts(profileSeeds, authorVideoPosts);
      }
      if (authorVideoPosts.length > 0) return authorVideoPosts;
      return seedPosts ?? [];
    }

    if (isExplorePlaylist) {
      const exploreSeeds = [...(exploreSeedPosts ?? []), ...(seedPosts ?? [])];
      if (exploreSeeds.length > 0) {
        return appendUniqueFeedPosts(exploreSeeds, exploreVideoPosts);
      }
      return exploreVideoPosts;
    }

    const homeSeeds = [...(homeSeedPosts ?? []), ...(seedPosts ?? [])];
    if (homeSeeds.length > 0) {
      return appendUniqueFeedPosts(homeSeeds, feedVideoPosts);
    }

    return feedVideoPosts;
  }, [
    authorVideoPosts,
    exploreSeedPosts,
    exploreVideoPosts,
    feedVideoPosts,
    homeSeedPosts,
    isExplorePlaylist,
    isProfilePlaylist,
    profileSeedPosts,
    seedPosts,
  ]);

  const loading = isProfilePlaylist
    ? authorLoading
    : isExplorePlaylist
      ? exploreLoading
      : feedLoading;
  const error = isProfilePlaylist
    ? authorError
    : isExplorePlaylist
      ? exploreError
      : feedError;
  const refresh = isProfilePlaylist
    ? authorRefresh
    : isExplorePlaylist
      ? exploreRefresh
      : feedRefresh;
  const hasNextPage = isProfilePlaylist
    ? authorHasNextPage
    : isExplorePlaylist
      ? exploreHasNextPage
      : feedHasNextPage;
  const isFetchingNextPage = isProfilePlaylist
    ? authorIsFetchingNextPage
    : isExplorePlaylist
      ? exploreIsFetchingNextPage
      : feedIsFetchingNextPage;
  const fetchNextPage = isProfilePlaylist
    ? authorFetchNextPage
    : isExplorePlaylist
      ? exploreFetchNextPage
      : feedFetchNextPage;
  const isRefetching = isProfilePlaylist
    ? authorIsRefetching
    : isExplorePlaylist
      ? exploreIsRefetching
      : feedIsRefetching;
  const updatePostScore = isExplorePlaylist
    ? exploreUpdatePostScore
    : feedUpdatePostScore;
  const engagementResetKey = isProfilePlaylist
    ? `reels-profile-${resolvedAuthorId}`
    : isExplorePlaylist
      ? `reels-explore-${getFilterSegmentLabel(resolvedExploreFilters)}`
      : feedEngagementResetKey;

  const postIds = useMemo(() => videoPosts.map((post) => post.id), [videoPosts]);
  useIncrementalEngagement(postIds, engagementResetKey);

  useEffect(() => {
    if (prevActiveIndexLogRef.current === activeIndex) {
      return;
    }
    devFlowLog("FlowPager", "activeIndex", {
      postId: videoPosts[activeIndex]?.id ?? null,
      activeIndex,
      status: `${prevActiveIndexLogRef.current}->${activeIndex} source=${activeIndexChangeSourceRef.current}`,
    });
    prevActiveIndexLogRef.current = activeIndex;
  }, [activeIndex, videoPosts]);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => {
        setScreenFocused(false);
        navigationScrollLockRef.current = null;
        resetActiveIndex();
      };
    }, [resetActiveIndex])
  );

  const resolveTargetIndex = useCallback(() => {
    if (!targetPostId || videoPosts.length === 0) return -1;
    return indexOfVideoPost(videoPosts, targetPostId);
  }, [targetPostId, videoPosts]);

  useLayoutEffect(() => {
    const index = resolveTargetIndex();
    if (index < 0) return;
    activeIndexChangeSourceRef.current = "init";
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, [resolveTargetIndex, setActiveIndex]);

  useLayoutEffect(() => {
    if (targetPostId) return;
    navigationScrollLockRef.current = null;
  }, [targetPostId]);

  useEffect(() => {
    if (!targetPostId || videoPosts.length === 0) return;

    const index = resolveTargetIndex();
    if (index < 0) {
      if (isProfilePlaylist && authorLoading) return;
      if (isExplorePlaylist && exploreLoading) return;
      navigationScrollLockRef.current = null;
      clearScrollTarget();
      clearFlowScrollTarget();
      return;
    }

    activeIndexChangeSourceRef.current = "init";
    activeIndexRef.current = index;
    setActiveIndex(index);
    navigationScrollLockRef.current = index;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const releaseScrollLock = () => {
      navigationScrollLockRef.current = null;
    };

    const attemptScroll = (attempt: number) => {
      if (cancelled) return;
      listRef.current?.scrollToIndex({ index, animated: false });
      if (attempt >= 8) {
        clearScrollTarget();
        clearFlowScrollTarget();
        releaseScrollLock();
      }
    };

    attemptScroll(0);
    for (let attempt = 1; attempt <= 8; attempt += 1) {
      timeouts.push(setTimeout(() => attemptScroll(attempt), 50 * attempt));
    }
    timeouts.push(
      setTimeout(() => {
        if (!cancelled) releaseScrollLock();
      }, TARGET_SCROLL_LOCK_MAX_MS)
    );

    return () => {
      cancelled = true;
      releaseScrollLock();
      for (const timeoutId of timeouts) clearTimeout(timeoutId);
    };
  }, [
    authorLoading,
    clearFlowScrollTarget,
    clearScrollTarget,
    exploreLoading,
    isExplorePlaylist,
    isProfilePlaylist,
    resolveTargetIndex,
    setActiveIndex,
    targetPostId,
    videoPosts,
  ]);

  const initialScrollIndex = useMemo(() => {
    if (!targetPostId) return undefined;
    const index = resolveTargetIndex();
    return index >= 0 ? index : undefined;
  }, [resolveTargetIndex, targetPostId]);

  const listKey = useMemo(() => {
    if (isProfilePlaylist && resolvedAuthorId) {
      const seedKey = seedPosts?.[0]?.id ?? profileSeedPosts?.[0]?.id ?? "browse";
      return `flow-profile-${resolvedAuthorId}-${seedKey}`;
    }
    if (isExplorePlaylist) {
      const filterKey = getFilterSegmentLabel(resolvedExploreFilters);
      const seedKey = seedPosts?.[0]?.id ?? exploreSeedPosts?.[0]?.id ?? "browse";
      return `flow-explore-${filterKey}-${seedKey}`;
    }
    if (seedPosts && seedPosts.length > 0) {
      return `flow-home-${feedMode}-${seedPosts[0].id}`;
    }
    return `flow-browse-${feedMode}`;
  }, [
    exploreSeedPosts,
    feedMode,
    isExplorePlaylist,
    isProfilePlaylist,
    profileSeedPosts,
    resolvedAuthorId,
    resolvedExploreFilters,
    seedPosts,
  ]);

  const backfillPagesRef = useRef(0);
  const [backfillExhausted, setBackfillExhausted] = useState(false);

  useEffect(() => {
    backfillPagesRef.current = 0;
    setBackfillExhausted(false);
  }, [listKey]);

  useEffect(() => {
    if (loading || error || isFetchingNextPage) return;
    if (videoPosts.length > 0) {
      backfillPagesRef.current = 0;
      setBackfillExhausted(false);
      return;
    }
    if (!hasNextPage) return;
    if (backfillPagesRef.current >= MAX_VIDEO_BACKFILL_PAGES) {
      setBackfillExhausted(true);
      return;
    }
    backfillPagesRef.current += 1;
    fetchNextPage();
  }, [
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    loading,
    videoPosts.length,
  ]);

  const setActiveIndexFromOffset = useCallback(
    (offsetY: number) => {
      if (videoPosts.length === 0 || reelHeight <= 0) return;

      const lockedIndex = navigationScrollLockRef.current;
      if (lockedIndex != null) {
        const expectedOffset = lockedIndex * reelHeight;
        if (
          Math.abs(offsetY - expectedOffset) <= TARGET_SCROLL_OFFSET_TOLERANCE_PX
        ) {
          navigationScrollLockRef.current = null;
          clearScrollTarget();
          clearFlowScrollTarget();
        }
        return;
      }

      const progress = offsetY / reelHeight;
      const predictedIndex = Math.round(progress);
      const clamped = Math.max(0, Math.min(predictedIndex, videoPosts.length - 1));

      if (clamped !== activeIndexRef.current) {
        activeIndexChangeSourceRef.current = "scroll";
        activeIndexRef.current = clamped;
        setActiveIndex(clamped);
      }
    },
    [clearFlowScrollTarget, clearScrollTarget, reelHeight, setActiveIndex, videoPosts.length]
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveIndexFromOffset(event.nativeEvent.contentOffset.y);
    },
    [setActiveIndexFromOffset]
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Post>[] }) => {
      if (navigationScrollLockRef.current != null) return;

      const setIndex = useReelsActiveIndexStore.getState().setActiveIndex;
      const primary = viewableItems.find(
        (token) => token.isViewable && token.index != null
      );

      if (primary?.index != null && primary.index !== activeIndexRef.current) {
        activeIndexChangeSourceRef.current = "viewability";
        activeIndexRef.current = primary.index;
        setIndex(primary.index);
      }
    }
  ).current;

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const predictedIndex =
        videoPosts.length === 0 || reelHeight <= 0
          ? -1
          : Math.max(
              0,
              Math.min(
                Math.round(offsetY / reelHeight),
                videoPosts.length - 1
              )
            );
      devFlowLog("FlowPager", "onMomentumScrollEnd", {
        postId: predictedIndex >= 0 ? videoPosts[predictedIndex]?.id ?? null : null,
        activeIndex: predictedIndex >= 0 ? predictedIndex : null,
        status: `offsetY=${offsetY}`,
      });
      setActiveIndexFromOffset(offsetY);
    },
    [reelHeight, setActiveIndexFromOffset, videoPosts]
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => {
      if (usePlayerPool) {
        return (
          <FlowRowSurface
            post={item}
            index={index}
            width={width}
            height={reelHeight}
            onScoreUpdate={updatePostScore}
            overlayBottomInset={fullscreen ? tabBarInset : insets.bottom}
          />
        );
      }

      return (
        <ReelRow
          post={item}
          index={index}
          enabled={screenFocused}
          width={width}
          height={reelHeight}
          onScoreUpdate={updatePostScore}
          overlayBottomInset={fullscreen ? tabBarInset : insets.bottom}
        />
      );
    },
    [
      fullscreen,
      insets.bottom,
      reelHeight,
      screenFocused,
      tabBarInset,
      updatePostScore,
      usePlayerPool,
      width,
    ]
  );

  const listEmpty = useMemo(() => {
    const searchingForVideos =
      videoPosts.length === 0 &&
      !backfillExhausted &&
      (loading || isFetchingNextPage || hasNextPage);

    if (searchingForVideos) {
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
  }, [
    backfillExhausted,
    error,
    hasNextPage,
    isFetchingNextPage,
    loading,
    reelHeight,
    videoPosts.length,
    width,
  ]);

  const listFooter = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View
        style={{ width, height: reelHeight }}
        className="items-center justify-center bg-black"
      >
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }, [isFetchingNextPage, reelHeight, width]);

  const listBody = (
    <PostInteractionProvider currentUserId={currentUserId}>
      {fullscreen ? <StatusBar hidden={screenFocused} style="light" /> : null}
      <View
        className="flex-1 bg-black"
        style={fullscreen ? undefined : { paddingTop: insets.top }}
      >
        <FlashList
          key={listKey}
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

  if (usePlayerPool) {
    return (
      <PlayerPoolProvider
        activeIndex={activeIndex}
        posts={videoPosts}
        enabled={screenFocused}
      >
        {listBody}
      </PlayerPoolProvider>
    );
  }

  return listBody;
}

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
import { PostInteractionProvider } from "../context/PostInteractionContext";
import { CONTENT_TYPE_LABELS } from "../constants/contentTypeLabels";
import { useReelsFeedInfinite } from "../hooks/useReelsFeedInfinite";
import { useReelsNavigationStore } from "../store/useReelsNavigationStore";
import type { Post } from "../types";
import {
  collectVideoPostsForPlaylist,
  indexOfVideoPost,
} from "../utils/videoPosts";
import { useReelsActiveIndexStore } from "../store/useReelsActiveIndexStore";
import { ReelRow } from "./ReelRow";

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 55,
  minimumViewTime: 0,
};

/** Boş video listesinde feed sayfalarını tarama üst sınırı (15 gönderi/sayfa). */
const MAX_VIDEO_BACKFILL_PAGES = 20;

function appendUniqueFeedPosts(seedPosts: Post[], feedPosts: Post[]): Post[] {
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
  /** Ana sayfa feed'inden önceden yüklenmiş videolar (anında oynatma). */
  homeSeedPosts?: Post[];
  /** Keşfet sekmesinde Flow filtresi ile tam ekran oynatma. */
  exploreBrowse?: boolean;
  exploreFilters?: UserMetadata | null;
  /** Keşfet feed'inden önceden yüklenmiş videolar (anında oynatma). */
  exploreSeedPosts?: Post[];
  /** Profil sekmesinde Flow filtresi ile tam ekran oynatma. */
  profileBrowse?: boolean;
  profileAuthorId?: string;
  /** Profil feed'inden önceden yüklenmiş videolar (anında oynatma). */
  profileSeedPosts?: Post[];
};

export function ReelsTabFeed({
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
}: ReelsTabFeedProps) {
  const { width, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { bottom: tabBarInset, tabBarHeight } = useTabBarContentInset();
  /** Item height === snap interval === list viewport (padding ile hizalı). */
  const reelHeight = Math.max(
    320,
    fullscreen
      ? windowHeight
      : windowHeight - tabBarHeight - insets.top
  );

  const listRef = useRef<FlashListRef<Post>>(null);
  const [screenFocused, setScreenFocused] = useState(true);
  const activeIndexRef = useRef(0);
  const setActiveIndex = useReelsActiveIndexStore((s) => s.setActiveIndex);
  const resetActiveIndex = useReelsActiveIndexStore((s) => s.resetActiveIndex);

  const targetPostId = useReelsNavigationStore((s) => s.targetPostId);
  const seedPosts = useReelsNavigationStore((s) => s.seedPosts);
  const playlistSource = useReelsNavigationStore((s) => s.playlistSource);
  const authorId = useReelsNavigationStore((s) => s.authorId);
  const navExploreFilters = useReelsNavigationStore((s) => s.exploreFilters);
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
      const profileSeeds = [
        ...(profileSeedPosts ?? []),
        ...(seedPosts ?? []),
      ];
      if (profileSeeds.length > 0) {
        return appendUniqueFeedPosts(profileSeeds, authorVideoPosts);
      }
      if (authorVideoPosts.length > 0) {
        return authorVideoPosts;
      }
      return seedPosts ?? [];
    }

    if (isExplorePlaylist) {
      const exploreSeeds = [
        ...(exploreSeedPosts ?? []),
        ...(seedPosts ?? []),
      ];
      if (exploreSeeds.length > 0) {
        return appendUniqueFeedPosts(exploreSeeds, exploreVideoPosts);
      }
      return exploreVideoPosts;
    }

    const homeSeeds = [
      ...(homeSeedPosts ?? []),
      ...(seedPosts ?? []),
    ];
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

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => {
        setScreenFocused(false);
        resetActiveIndex();
      };
    }, [resetActiveIndex])
  );

  const resolveTargetIndex = useCallback(() => {
    if (!targetPostId || videoPosts.length === 0) {
      return -1;
    }
    return indexOfVideoPost(videoPosts, targetPostId);
  }, [targetPostId, videoPosts]);

  useLayoutEffect(() => {
    const index = resolveTargetIndex();
    if (index < 0) {
      return;
    }
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, [resolveTargetIndex, setActiveIndex]);

  useLayoutEffect(() => {
    if (targetPostId) {
      return;
    }
    activeIndexRef.current = 0;
    resetActiveIndex();
  }, [resetActiveIndex, targetPostId]);

  useEffect(() => {
    if (!targetPostId || videoPosts.length === 0) {
      return;
    }

    const index = resolveTargetIndex();
    if (index < 0) {
      if (isProfilePlaylist && authorLoading) {
        return;
      }
      if (isExplorePlaylist && exploreLoading) {
        return;
      }
      clearScrollTarget();
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

      if (attempt >= 8) {
        clearScrollTarget();
      }
    };

    attemptScroll(0);
    for (let attempt = 1; attempt <= 8; attempt += 1) {
      timeouts.push(setTimeout(() => attemptScroll(attempt), 50 * attempt));
    }

    return () => {
      cancelled = true;
      for (const timeoutId of timeouts) {
        clearTimeout(timeoutId);
      }
    };
  }, [
    authorLoading,
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
    if (!targetPostId) {
      return undefined;
    }

    const index = resolveTargetIndex();
    return index >= 0 ? index : undefined;
  }, [resolveTargetIndex, targetPostId]);

  const listKey = useMemo(() => {
    if (isProfilePlaylist && resolvedAuthorId) {
      const seedKey =
        seedPosts?.[0]?.id ?? profileSeedPosts?.[0]?.id ?? "browse";
      return `reels-profile-${resolvedAuthorId}-${seedKey}`;
    }
    if (isExplorePlaylist) {
      const filterKey = getFilterSegmentLabel(resolvedExploreFilters);
      const seedKey =
        seedPosts?.[0]?.id ?? exploreSeedPosts?.[0]?.id ?? "browse";
      return `reels-explore-${filterKey}-${seedKey}`;
    }
    if (seedPosts && seedPosts.length > 0) {
      return `reels-home-${feedMode}-${seedPosts[0].id}`;
    }
    return `reels-browse-${feedMode}`;
  }, [
    authorId,
    exploreSeedPosts,
    feedMode,
    isExplorePlaylist,
    isProfilePlaylist,
    profileSeedPosts,
    resolvedAuthorId,
    resolvedExploreFilters,
    seedPosts,
  ]);

  const flashListKey = listKey;

  const backfillPagesRef = useRef(0);
  const [backfillExhausted, setBackfillExhausted] = useState(false);

  useEffect(() => {
    backfillPagesRef.current = 0;
    setBackfillExhausted(false);
  }, [listKey]);

  useEffect(() => {
    if (loading || error || isFetchingNextPage) {
      return;
    }

    if (videoPosts.length > 0) {
      backfillPagesRef.current = 0;
      setBackfillExhausted(false);
      return;
    }

    if (!hasNextPage) {
      return;
    }

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
      fetchNextPage();
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
  }, [backfillExhausted, error, hasNextPage, isFetchingNextPage, loading, reelHeight, videoPosts.length, width]);

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
      {fullscreen ? (
        <StatusBar hidden={screenFocused} style="light" />
      ) : null}
      <View
        className="flex-1 bg-black"
        style={fullscreen ? undefined : { paddingTop: insets.top }}
      >
        <FlashList
          key={flashListKey}
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

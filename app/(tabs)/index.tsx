import {
  useIsFocused,
  useNavigation,
  useScrollToTop,
  type ParamListBase,
} from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import type { FlashListRef } from "@shopify/flash-list";
import { HomeFeedContentFilter } from "@/components/HomeFeedContentFilter";
import {
  HomeFeedModeToggle,
  type HomeFeedMode,
} from "@/components/HomeFeedModeToggle";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { useAuth } from "@/features/auth";
import { StoryRingsRow } from "@/features/stories";
import { StoriesRingBootstrap } from "@/features/stories/components/StoriesRingBootstrap";
import { useFollowingFeedInfinite } from "@/features/explore/hooks/useFollowingFeedInfinite";
import { useHomeFeedInfinite } from "@/features/explore/hooks/useHomeFeedInfinite";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { ReelsTabFeed } from "@/features/posts/components/ReelsTabFeed";
import { useHomeFeedContentStore } from "@/features/posts/store/useHomeFeedContentStore";
import { useReelsActiveIndexStore } from "@/features/posts/store/useReelsActiveIndexStore";
import { useReelsNavigationStore } from "@/features/posts/store/useReelsNavigationStore";
import { filterPostsByContentType } from "@/features/posts/utils/filterPostsByContentType";
import { getEmptyFeedMessage } from "@/features/posts/constants/contentTypeLabels";
import { collectVideoPostsForPlaylist } from "@/features/posts/utils/videoPosts";
import { useStoriesRingStore } from "@/features/stories/store/useStoriesRingStore";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { isFixedSlotFeedEnabled, isFeedV2Enabled } from "@/lib/featureFlags/feedFlags";
import { useFeedBuffer } from "@/features/feed/useFeedBuffer";
import {
  FeedScroller,
  FlowPager,
  useHomeFeedEngine,
  openFlow,
  closeFlow,
  type FeedV2ListItem,
} from "@/features/feed-v2";

export default function HomeScreen() {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();
  const feedV2 = isFeedV2Enabled(user?.uid ?? null);

  const legacyListRef = useRef<FlashListRef<FeedListItem>>(null);
  const v2ListRef = useRef<FlashListRef<FeedV2ListItem>>(null);
  useScrollToTop(feedV2 ? v2ListRef : legacyListRef);

  const contentFilter = useHomeFeedContentStore((s) => s.contentFilter);
  const setContentFilter = useHomeFeedContentStore((s) => s.setContentFilter);

  const handleContentFilterChange = useCallback(
    (filter: Parameters<typeof setContentFilter>[0]) => {
      const leavingVideo = contentFilter === "video" && filter !== "video";
      const enteringVideo = filter === "video";

      if (leavingVideo) {
        closeFlow();
      } else if (enteringVideo) {
        if (feedV2) {
          useReelsNavigationStore.getState().clearNavigation();
          openFlow(null, [], null, { navigateHome: false });
        } else {
          useReelsNavigationStore.getState().clearNavigation();
          useReelsActiveIndexStore.getState().resetActiveIndex();
        }
      }
      setContentFilter(filter);
    },
    [contentFilter, feedV2, setContentFilter]
  );

  const [feedMode, setFeedMode] = useState<HomeFeedMode>("global");
  const [storyReloadSignal, setStoryReloadSignal] = useState(0);
  const displayName = useProfileStore((s) => s.displayName);
  const photoURL = useProfileStore((s) => s.photoURL);

  const globalFeed = useHomeFeedInfinite(feedMode === "global" && !feedV2);
  const followingFeed = useFollowingFeedInfinite(
    feedMode === "following" && !feedV2
  );
  const v2Engine = useHomeFeedEngine(feedMode, contentFilter, feedV2);

  const activeFeed = feedMode === "global" ? globalFeed : followingFeed;
  const fixedSlotFeed = isFixedSlotFeedEnabled(user?.uid ?? null);

  const bufferedGlobalPosts = useFeedBuffer(globalFeed.recentPosts, {
    feedKey: `home-global-${feedMode}`,
    hasNextPage: globalFeed.hasNextPage,
    isFetchingNextPage: globalFeed.isFetchingNextPage,
  });

  const bufferedFollowingPosts = useFeedBuffer(followingFeed.posts, {
    feedKey: `home-following-${feedMode}`,
    hasNextPage: followingFeed.hasNextPage,
    isFetchingNextPage: followingFeed.isFetchingNextPage,
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      if (contentFilter === "video") {
        closeFlow();
      }
    });

    return unsubscribe;
  }, [navigation, contentFilter]);

  const handleRefresh = useCallback(() => {
    setStoryReloadSignal((value) => value + 1);
    void useStoriesRingStore.getState().reload();
    if (feedV2) {
      void v2Engine.refresh();
    } else {
      void activeFeed.refresh();
    }
  }, [activeFeed, feedV2, v2Engine]);

  const listContentFilter =
    contentFilter === "video" ? null : contentFilter;

  const legacyVideoPosts = useMemo(() => {
    if (feedMode === "global") {
      return collectVideoPostsForPlaylist(globalFeed.recentPosts);
    }
    return collectVideoPostsForPlaylist(followingFeed.posts);
  }, [feedMode, globalFeed.recentPosts, followingFeed.posts]);

  const videoPosts = feedV2 ? v2Engine.videoPosts : legacyVideoPosts;

  const feedItems = useMemo((): FeedListItem[] => {
    if (feedV2) {
      return [];
    }
    if (feedMode === "following") {
      return filterPostsByContentType(
        bufferedFollowingPosts,
        listContentFilter
      ).map((post) => ({
        kind: "post" as const,
        key: post.id,
        post,
      }));
    }

    return filterPostsByContentType(
      bufferedGlobalPosts,
      listContentFilter
    ).map((post) => ({
      kind: "post" as const,
      key: post.id,
      post,
    }));
  }, [
    feedV2,
    feedMode,
    bufferedFollowingPosts,
    bufferedGlobalPosts,
    listContentFilter,
  ]);

  const emptyMessage = useMemo(() => {
    if (listContentFilter === "tweet" || listContentFilter === "image") {
      return getEmptyFeedMessage(listContentFilter);
    }
    if (feedMode === "following") {
      return "Henüz kimseyi takip etmiyorsun veya takip ettiklerinden gönderi yok. Profillere gidip Takip Et'e basabilirsin.";
    }
    return "Henüz gönderi yok. Paylaş sekmesinden ilk gönderinizi oluşturun.";
  }, [feedMode, listContentFilter]);

  const listHeader = useMemo(
    () => (
      <View>
        <View className="pb-2 pt-1">
          <StoryRingsRow
            currentUserId={user?.uid ?? null}
            currentUserDisplayName={displayName || "Sen"}
            currentUserPhotoURL={photoURL || user?.photoURL}
            reloadSignal={storyReloadSignal}
          />
        </View>
        <HomeFeedModeToggle mode={feedMode} onModeChange={setFeedMode} />
        <HomeFeedContentFilter
          contentFilter={contentFilter}
          onContentFilterChange={handleContentFilterChange}
        />
      </View>
    ),
    [
      contentFilter,
      displayName,
      feedMode,
      handleContentFilterChange,
      photoURL,
      storyReloadSignal,
      user?.photoURL,
      user?.uid,
    ]
  );

  const feedListContentStyle = useMemo(
    (): StyleProp<ViewStyle> => ({
      paddingHorizontal: 16,
      paddingTop: 0,
      paddingBottom: 16,
    }),
    []
  );

  if (contentFilter === "video") {
    return (
      <View className="flex-1 bg-black">
        {feedV2 ? (
          <FlowPager
            currentUserId={user?.uid ?? null}
            feedMode={feedMode}
            fullscreen
            homeSeedPosts={videoPosts}
          />
        ) : (
          <ReelsTabFeed
            currentUserId={user?.uid ?? null}
            feedMode={feedMode}
            fullscreen
            homeSeedPosts={videoPosts}
          />
        )}
      </View>
    );
  }

  if (feedV2) {
    return (
      <TabScreenSafeArea className="flex-1 bg-white">
        <StoriesRingBootstrap />
        <View className="min-h-0 flex-1">
          <FeedScroller
            items={v2Engine.items}
            videoPosts={v2Engine.videoPosts}
            loading={v2Engine.loading}
            error={v2Engine.error}
            emptyMessage={emptyMessage}
            onRefresh={handleRefresh}
            onScoreUpdate={v2Engine.updatePostScore}
            ListHeaderComponent={listHeader}
            hasNextPage={v2Engine.hasNextPage}
            isFetchingNextPage={v2Engine.isFetchingNextPage}
            onLoadMore={v2Engine.fetchNextPage}
            isRefetching={v2Engine.isRefetching}
            listRef={v2ListRef}
            currentUserId={user?.uid ?? null}
            contentContainerStyle={feedListContentStyle}
            reelsSource="home"
            prefetchEnabled={isFocused}
          />
        </View>
      </TabScreenSafeArea>
    );
  }

  const loading = activeFeed.loading;
  const error = activeFeed.error;

  return (
    <TabScreenSafeArea className={fixedSlotFeed ? "flex-1 bg-white" : "flex-1 bg-gray-50"}>
      <StoriesRingBootstrap />
      <View className="min-h-0 flex-1">
        <FeedFlashList
          items={feedItems}
          videoPosts={videoPosts}
          loading={loading}
          error={error}
          emptyMessage={emptyMessage}
          onRefresh={handleRefresh}
          onScoreUpdate={activeFeed.updatePostScore}
          ListHeaderComponent={listHeader}
          hasNextPage={activeFeed.hasNextPage}
          isFetchingNextPage={activeFeed.isFetchingNextPage}
          onLoadMore={activeFeed.fetchNextPage}
          isRefetching={activeFeed.isRefetching}
          listRef={legacyListRef}
          currentUserId={user?.uid ?? null}
          contentContainerStyle={feedListContentStyle}
          reelsSource="home"
          streamCell={fixedSlotFeed}
          prefetchEnabled={isFocused}
        />
      </View>
    </TabScreenSafeArea>
  );
}

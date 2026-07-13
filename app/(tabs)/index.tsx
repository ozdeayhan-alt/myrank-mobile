import {
  useIsFocused,
  useScrollToTop,
} from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import type { FlashListRef } from "@shopify/flash-list";
import { HomeFeedContentFilter } from "@/components/HomeFeedContentFilter";
import {
  HomeFeedModeToggle,
  type HomeFeedMode,
} from "@/components/HomeFeedModeToggle";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { useAuth } from "@/features/auth";
import { toFeedApiContentType } from "@/features/feed/feedContentType";
import { useFollowingFeedInfinite } from "@/features/explore/hooks/useFollowingFeedInfinite";
import { useHomeFeedInfinite } from "@/features/explore/hooks/useHomeFeedInfinite";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { useHomeFeedContentStore } from "@/features/posts/store/useHomeFeedContentStore";
import { getEmptyFeedMessage } from "@/features/posts/constants/contentTypeLabels";
import { DEFAULT_LIST_HORIZONTAL_INSET } from "@/features/posts/constants/feedMediaLayout";
import { isFixedSlotFeedEnabled, isFeedV2Enabled } from "@/lib/featureFlags/feedFlags";
import { useFeedBuffer } from "@/features/feed/useFeedBuffer";
import { FlowFeedScreen } from "@/features/flow/components/FlowFeedScreen";
import { usePrefetchFlowFeedOnHome } from "@/features/flow/hooks/usePrefetchFlowFeedOnHome";
import { mapPostsToLegacyFeedItems } from "@/features/flow/utils/groupPostsForMixedFeed";
import {
  FeedScroller,
  useHomeFeedEngine,
  type FeedV2ListItem,
} from "@/features/feed-v2";

export default function HomeScreen() {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const feedV2 = isFeedV2Enabled(user?.uid ?? null);

  const legacyListRef = useRef<FlashListRef<FeedListItem>>(null);
  const v2ListRef = useRef<FlashListRef<FeedV2ListItem>>(null);
  useScrollToTop(feedV2 ? v2ListRef : legacyListRef);

  const contentFilter = useHomeFeedContentStore((s) => s.contentFilter);
  const setContentFilter = useHomeFeedContentStore((s) => s.setContentFilter);

  const [feedMode, setFeedMode] = useState<HomeFeedMode>("global");
  const isFlowMode = contentFilter === "flow";
  const apiContentType = toFeedApiContentType(contentFilter);

  usePrefetchFlowFeedOnHome({
    feedMode,
    enabled: isFocused && !isFlowMode,
  });

  const globalFeed = useHomeFeedInfinite(
    apiContentType,
    feedMode === "global" && !feedV2 && !isFlowMode
  );
  const followingFeed = useFollowingFeedInfinite(
    apiContentType,
    feedMode === "following" && !feedV2 && !isFlowMode
  );
  const v2Engine = useHomeFeedEngine(
    feedMode,
    contentFilter,
    feedV2 && !isFlowMode
  );

  const activeFeed = feedMode === "global" ? globalFeed : followingFeed;
  const fixedSlotFeed = isFixedSlotFeedEnabled(user?.uid ?? null);

  const bufferedGlobalPosts = useFeedBuffer(globalFeed.recentPosts, {
    feedKey: `home-global-${feedMode}-${apiContentType}`,
    hasNextPage: globalFeed.hasNextPage,
    isFetchingNextPage: globalFeed.isFetchingNextPage,
  });

  const bufferedFollowingPosts = useFeedBuffer(followingFeed.posts, {
    feedKey: `home-following-${feedMode}-${apiContentType}`,
    hasNextPage: followingFeed.hasNextPage,
    isFetchingNextPage: followingFeed.isFetchingNextPage,
  });

  const handleRefresh = useCallback(() => {
    if (feedV2) {
      void v2Engine.refresh();
    } else {
      void activeFeed.refresh();
    }
  }, [activeFeed, feedV2, v2Engine]);

  const feedItems = useMemo((): FeedListItem[] => {
    if (feedV2) {
      return [];
    }
    const posts =
      feedMode === "following" ? bufferedFollowingPosts : bufferedGlobalPosts;
    return mapPostsToLegacyFeedItems(posts);
  }, [feedV2, feedMode, bufferedFollowingPosts, bufferedGlobalPosts]);

  const emptyMessage = useMemo(() => {
    if (contentFilter === "flow") {
      return "Henüz Flow yok.";
    }
    if (contentFilter === "tweet" || contentFilter === "image") {
      return getEmptyFeedMessage(contentFilter);
    }
    if (feedMode === "following") {
      return "Henüz kimseyi takip etmiyorsun veya takip ettiklerinden gönderi yok. Profillere gidip Takip Et'e basabilirsin.";
    }
    return "Henüz gönderi yok. Düello kartı en az bir gönderi olduğunda feed içinde görünür.";
  }, [feedMode, contentFilter]);

  const listHeader = useMemo(
    () => (
      <View>
        <HomeFeedModeToggle mode={feedMode} onModeChange={setFeedMode} />
        <HomeFeedContentFilter
          contentFilter={contentFilter}
          onContentFilterChange={setContentFilter}
        />
      </View>
    ),
    [contentFilter, feedMode, setContentFilter]
  );

  const feedListContentStyle = useMemo(
    (): StyleProp<ViewStyle> => ({
      paddingHorizontal: DEFAULT_LIST_HORIZONTAL_INSET,
      paddingTop: 0,
      paddingBottom: 16,
    }),
    []
  );

  if (isFlowMode) {
    return (
      <TabScreenSafeArea className="flex-1 bg-white">
        <View className="min-h-0 flex-1">
          <FlowFeedScreen
            variant={feedMode === "following" ? "following" : "home"}
            enabled={isFocused}
            ListHeaderComponent={listHeader}
            emptyMessage={emptyMessage}
          />
        </View>
      </TabScreenSafeArea>
    );
  }

  if (feedV2) {
    return (
      <TabScreenSafeArea className="flex-1 bg-white">
        <View className="min-h-0 flex-1">
          <FeedScroller
            items={v2Engine.items}
            loading={v2Engine.loading}
            error={v2Engine.error}
            emptyMessage={emptyMessage}
            onRefresh={handleRefresh}
            onScoreUpdate={v2Engine.updatePostScore}
            ListHeaderComponent={listHeader}
            hasNextPage={v2Engine.hasNextPage}
            isFetchingNextPage={v2Engine.isFetchingNextPage}
            isFetching={v2Engine.isFetching}
            onLoadMore={v2Engine.fetchNextPage}
            isRefetching={v2Engine.isRefetching}
            listRef={v2ListRef}
            currentUserId={user?.uid ?? null}
            contentContainerStyle={feedListContentStyle}
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
      <View className="min-h-0 flex-1">
        <FeedFlashList
          items={feedItems}
          loading={loading}
          error={error}
          emptyMessage={emptyMessage}
          onRefresh={handleRefresh}
          onScoreUpdate={activeFeed.updatePostScore}
          ListHeaderComponent={listHeader}
          hasNextPage={activeFeed.hasNextPage}
          isFetchingNextPage={activeFeed.isFetchingNextPage}
          isFetching={activeFeed.isFetching}
          onLoadMore={activeFeed.fetchNextPage}
          isRefetching={activeFeed.isRefetching}
          listRef={legacyListRef}
          currentUserId={user?.uid ?? null}
          contentContainerStyle={feedListContentStyle}
          streamCell={fixedSlotFeed}
          prefetchEnabled={isFocused}
        />
      </View>
    </TabScreenSafeArea>
  );
}

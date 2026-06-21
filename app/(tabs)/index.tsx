import {
  useNavigation,
  useScrollToTop,
  type ParamListBase,
} from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import type { FlashListRef } from "@shopify/flash-list";
import { HomeFeedContentFilter } from "@/components/HomeFeedContentFilter";
import {
  HomeFeedModeToggle,
  type HomeFeedMode,
} from "@/components/HomeFeedModeToggle";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { useAuth } from "@/features/auth";
import { StoryRingsRow } from "@/features/ai-story";
import { useFollowingFeedInfinite } from "@/features/explore/hooks/useFollowingFeedInfinite";
import { useHomeFeedInfinite } from "@/features/explore/hooks/useHomeFeedInfinite";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { ReelsTabFeed } from "@/features/posts/components/ReelsTabFeed";
import { useHomeFeedContentStore } from "@/features/posts/store/useHomeFeedContentStore";
import { filterPostsByContentType } from "@/features/posts/utils/filterPostsByContentType";
import { getEmptyFeedMessage } from "@/features/posts/constants/contentTypeLabels";
import { filterVideoPosts } from "@/features/posts/utils/videoPosts";
import { useProfileStore } from "@/features/profile/store/useProfileStore";

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();
  const listRef = useRef<FlashListRef<FeedListItem>>(null);
  useScrollToTop(listRef);

  const contentFilter = useHomeFeedContentStore((s) => s.contentFilter);
  const setContentFilter = useHomeFeedContentStore((s) => s.setContentFilter);
  const [feedMode, setFeedMode] = useState<HomeFeedMode>("global");
  const [storyReloadSignal, setStoryReloadSignal] = useState(0);
  const displayName = useProfileStore((s) => s.displayName);
  const photoURL = useProfileStore((s) => s.photoURL);

  const globalFeed = useHomeFeedInfinite(
    contentFilter !== "video" && feedMode === "global"
  );
  const followingFeed = useFollowingFeedInfinite(
    contentFilter !== "video" && feedMode === "following"
  );

  const activeFeed = feedMode === "global" ? globalFeed : followingFeed;

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      if (contentFilter === "video") {
        setContentFilter(null);
      }
    });

    return unsubscribe;
  }, [navigation, contentFilter, setContentFilter]);

  const handleRefresh = useCallback(() => {
    setStoryReloadSignal((value) => value + 1);
    void activeFeed.refresh();
  }, [activeFeed]);

  const listContentFilter =
    contentFilter === "video" ? null : contentFilter;

  const videoPosts = useMemo(() => {
    if (feedMode === "global") {
      return filterVideoPosts(globalFeed.recentPosts);
    }
    return filterVideoPosts(followingFeed.posts);
  }, [feedMode, globalFeed.recentPosts, followingFeed.posts]);

  const feedItems = useMemo((): FeedListItem[] => {
    if (feedMode === "following") {
      return filterPostsByContentType(
        followingFeed.posts,
        listContentFilter
      ).map((post) => ({
        kind: "post" as const,
        key: post.id,
        post,
      }));
    }

    return filterPostsByContentType(
      globalFeed.recentPosts,
      listContentFilter
    ).map((post) => ({
      kind: "post" as const,
      key: post.id,
      post,
    }));
  }, [
    feedMode,
    followingFeed.posts,
    globalFeed.recentPosts,
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
      <>
        <StoryRingsRow
          currentUserId={user?.uid ?? null}
          currentUserDisplayName={displayName || "Sen"}
          currentUserPhotoURL={photoURL || user?.photoURL}
          reloadSignal={storyReloadSignal}
        />
        <HomeFeedModeToggle mode={feedMode} onModeChange={setFeedMode} />
        <HomeFeedContentFilter
          contentFilter={contentFilter}
          onContentFilterChange={setContentFilter}
        />
      </>
    ),
    [
      contentFilter,
      displayName,
      feedMode,
      photoURL,
      setContentFilter,
      setFeedMode,
      storyReloadSignal,
      user?.photoURL,
      user?.uid,
    ]
  );

  if (contentFilter === "video") {
    return (
      <View className="flex-1 bg-black">
        <ReelsTabFeed
          currentUserId={user?.uid ?? null}
          feedMode={feedMode}
          fullscreen
        />
      </View>
    );
  }

  const loading = activeFeed.loading;
  const error = activeFeed.error;

  return (
    <TabScreenSafeArea className="flex-1 bg-gray-50">
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
        listRef={listRef}
        currentUserId={user?.uid ?? null}
      />
    </TabScreenSafeArea>
  );
}

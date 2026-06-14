import { useCallback, useMemo, useRef, useState } from "react";
import { useScrollToTop } from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import {
  HomeFeedModeToggle,
  type HomeFeedMode,
} from "@/components/HomeFeedModeToggle";
import { HomeFeedHeader } from "@/components/HomeFeedHeader";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { useAuth } from "@/features/auth";
import { useFollowingFeedInfinite } from "@/features/explore/hooks/useFollowingFeedInfinite";
import { useHomeFeedInfinite } from "@/features/explore/hooks/useHomeFeedInfinite";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import {
  filterVideoPosts,
  mergeHomeFeedVideoPosts,
} from "@/features/posts/utils/videoPosts";

export default function HomeScreen() {
  const { user } = useAuth();
  const listRef = useRef<FlashListRef<FeedListItem>>(null);
  useScrollToTop(listRef);

  const [mode, setMode] = useState<HomeFeedMode>("global");

  const globalFeed = useHomeFeedInfinite(mode === "global");
  const followingFeed = useFollowingFeedInfinite(mode === "following");

  const activeFeed = mode === "global" ? globalFeed : followingFeed;

  const handleRefresh = useCallback(() => {
    void activeFeed.refresh();
  }, [activeFeed]);

  const globalRecentIds = useMemo(
    () => new Set(globalFeed.recentPosts.map((p) => p.id)),
    [globalFeed.recentPosts]
  );
  const globalTopOnly = useMemo(
    () => globalFeed.topPosts.filter((p) => !globalRecentIds.has(p.id)),
    [globalFeed.topPosts, globalRecentIds]
  );

  const videoPosts = useMemo(() => {
    if (mode === "global") {
      return mergeHomeFeedVideoPosts(
        globalFeed.recentPosts,
        globalFeed.topPosts
      );
    }
    return filterVideoPosts(followingFeed.posts);
  }, [mode, globalFeed.recentPosts, globalFeed.topPosts, followingFeed.posts]);

  const feedItems = useMemo((): FeedListItem[] => {
    if (mode === "following") {
      return followingFeed.posts.map((post) => ({
        kind: "post" as const,
        key: post.id,
        post,
      }));
    }

    if (globalFeed.recentPosts.length === 0 && globalTopOnly.length === 0) {
      return [];
    }

    const items: FeedListItem[] = [];

    for (const post of globalFeed.recentPosts) {
      items.push({ kind: "post", key: post.id, post });
    }

    if (globalTopOnly.length > 0) {
      items.push({
        kind: "header",
        key: "header-top",
        title: "En yüksek puanlı",
        subtitle: "Yukarıdaki listede olmayan öne çıkan gönderiler.",
      });
      for (const post of globalTopOnly) {
        items.push({ kind: "post", key: `top-${post.id}`, post });
      }
    }

    return items;
  }, [mode, followingFeed.posts, globalFeed.recentPosts, globalTopOnly]);

  const emptyMessage =
    mode === "following"
      ? "Henüz kimseyi takip etmiyorsun veya takip ettiklerinden gönderi yok. Profillere gidip Takip Et'e basabilirsin."
      : "Henüz gönderi yok. Paylaş sekmesinden ilk gönderinizi oluşturun.";

  const listHeader = useMemo(
    () => (
      <>
        <HomeFeedHeader />
        <HomeFeedModeToggle mode={mode} onModeChange={setMode} />
      </>
    ),
    [mode]
  );

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

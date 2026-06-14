import { useCallback, useMemo } from "react";
import { useAuth } from "@/features/auth";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { filterVideoPosts } from "@/features/posts/utils/videoPosts";
import { useSavedPosts } from "@/features/saved/hooks/useSavedPosts";

export default function SavedScreen() {
  const { user } = useAuth();
  const { posts, loading, error, refresh, isRefetching } = useSavedPosts(
    user?.uid
  );

  const items = useMemo(
    (): FeedListItem[] =>
      posts.map((post) => ({
        kind: "post",
        key: post.id,
        post,
      })),
    [posts]
  );

  const videoPosts = useMemo(() => filterVideoPosts(posts), [posts]);

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <FeedFlashList
        items={items}
        videoPosts={videoPosts}
        loading={loading}
        error={error}
        emptyMessage="Henüz kaydettiğiniz gönderi yok."
        onRefresh={handleRefresh}
        isRefetching={isRefetching}
        engagementResetKey={`saved-${user?.uid ?? ""}`}
        currentUserId={user?.uid ?? null}
      />
  );
}

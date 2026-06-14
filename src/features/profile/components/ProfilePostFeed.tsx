import { memo, useCallback, useMemo } from "react";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { filterVideoPosts } from "@/features/posts/utils/videoPosts";
import { useAuthorPosts } from "../hooks/useAuthorPosts";

type ProfilePostFeedProps = {
  authorId: string;
};

function ProfilePostFeedInner({ authorId }: ProfilePostFeedProps) {
  const {
    posts,
    loading,
    error,
    refresh,
    removePost,
    updatePostContent,
    isRefetching,
  } = useAuthorPosts(authorId);

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
      emptyMessage="Henüz gönderi yok."
      onRefresh={handleRefresh}
      isRefetching={isRefetching}
      engagementResetKey={`profile-feed-${authorId}`}
      onPostDeleted={removePost}
      onPostContentUpdated={updatePostContent}
      contentContainerStyle={{ paddingHorizontal: 0, paddingVertical: 0 }}
    />
  );
}

export const ProfilePostFeed = memo(ProfilePostFeedInner);

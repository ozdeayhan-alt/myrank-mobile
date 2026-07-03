import { memo, useCallback, useMemo } from "react";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { PROFILE_HORIZONTAL_PADDING } from "../profileLayout";
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
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
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

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <FeedFlashList
      items={items}
      loading={loading}
      error={error}
      emptyMessage="Henüz gönderi yok."
      onRefresh={handleRefresh}
      isRefetching={isRefetching}
      engagementResetKey={`profile-feed-${authorId}`}
      onPostDeleted={removePost}
      onPostContentUpdated={updatePostContent}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={fetchNextPage}
      contentContainerStyle={{
        paddingHorizontal: PROFILE_HORIZONTAL_PADDING,
        paddingVertical: 0,
      }}
      listHorizontalInset={PROFILE_HORIZONTAL_PADDING}
      mediaEdgeBleed={false}
    />
  );
}

export const ProfilePostFeed = memo(ProfilePostFeedInner);

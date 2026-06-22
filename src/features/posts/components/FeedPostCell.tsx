import { memo, useCallback, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import type { EngagementStatus } from "@/features/ranking/types";
import { SPINNER_COLOR, ui } from "@/lib/uiClasses";
import { useOpenCommentSheet } from "../hooks/useOpenCommentSheet";
import { usePostCardOwnerActions } from "../hooks/usePostCardOwnerActions";
import { useShareAndRepost } from "../hooks/useShareAndRepost";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";
import type { Post } from "../types";
import { EditPostTextModal } from "./EditPostTextModal";
import { PostCardActionBar } from "./PostCardActionBar";
import { PostCardBody } from "./PostCardBody";
import { PostHeader } from "./PostHeader";
import { PostShareModals } from "./PostShareModals";

type FeedPostCellProps = PostFeedMediaLayoutOptions & {
  post: Post;
  engagement: EngagementStatus;
  patchEngagement: (patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onOpenVideo?: (postId: string) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  currentUserId?: string | null;
  inlineAutoplay?: boolean;
};

export const FeedPostCell = memo(function FeedPostCell({
  post,
  engagement,
  patchEngagement,
  onScoreUpdate,
  onOpenVideo,
  onPostDeleted,
  onPostContentUpdated,
  currentUserId = null,
  inlineAutoplay = false,
  listHorizontalInset,
  mediaEdgeBleed,
}: FeedPostCellProps) {
  const [heartBurstKey, setHeartBurstKey] = useState(0);
  const openCommentSheet = useOpenCommentSheet();
  const isOwner = Boolean(currentUserId && post.authorId === currentUserId);

  const {
    displayPost,
    editOpen,
    setEditOpen,
    ownerActionLoading,
    handleOwnerMenuPress,
    handleMoreMenuPress,
    handleEditSave,
  } = usePostCardOwnerActions({
    post,
    currentUserId,
    onPostDeleted,
    onPostContentUpdated,
  });

  const {
    score,
    counts,
    loading,
    handleLike,
    handleDislike,
    handleSharePress,
    handleSave,
    applyCommentResult,
    shareActive,
    saveActive,
    shareSheetOpen,
    setShareSheetOpen,
    repostOpen,
    setRepostOpen,
    handleReposted,
    canRepost,
    handleRepostSelect,
    handleStorySelect,
    handleExternalShareSelect,
  } = useShareAndRepost({
    post,
    currentUserId,
    engagement,
    onEngagementPatch: patchEngagement,
    onScoreUpdate,
  });

  const triggerLikeHeart = useCallback(() => {
    setHeartBurstKey((key) => key + 1);
  }, []);

  const handleLikePress = useCallback(() => {
    handleLike();
    triggerLikeHeart();
  }, [handleLike, triggerLikeHeart]);

  const handleDislikePress = useCallback(() => {
    handleDislike();
  }, [handleDislike]);

  return (
    <>
      <View
        className={ui.postCard}
        style={Platform.OS === "android" ? { elevation: 3 } : undefined}
      >
        <PostHeader
          post={displayPost}
          score={score}
          isOwner={isOwner}
          currentUserId={currentUserId}
          onOwnerMenuPress={isOwner ? handleOwnerMenuPress : undefined}
          onMoreMenuPress={!isOwner ? handleMoreMenuPress : undefined}
        />

        <PostCardBody
          post={displayPost}
          heartBurstKey={heartBurstKey}
          onLike={handleLike}
          onLikeAnimated={triggerLikeHeart}
          onOpenVideo={onOpenVideo}
          currentUserId={currentUserId}
          mediaImagePriority="high"
          inlineAutoplay={inlineAutoplay}
          listHorizontalInset={listHorizontalInset}
          mediaEdgeBleed={mediaEdgeBleed}
        />

        <PostCardActionBar
          counts={counts}
          shareActive={shareActive}
          saveActive={saveActive}
          loading={loading}
          onLikePress={handleLikePress}
          onDislikePress={handleDislikePress}
          onCommentPress={() =>
            openCommentSheet(post.id, applyCommentResult)
          }
          onSharePress={handleSharePress}
          onSavePress={handleSave}
        />

        {loading || ownerActionLoading ? (
          <View className="items-center py-2">
            <ActivityIndicator size="small" color={SPINNER_COLOR} />
          </View>
        ) : null}
      </View>

      {editOpen ? (
        <EditPostTextModal
          visible
          contentType={post.contentType ?? "tweet"}
          initialContent={displayPost.content ?? ""}
          submitting={ownerActionLoading}
          onClose={() => setEditOpen(false)}
          onSave={handleEditSave}
        />
      ) : null}

      <PostShareModals
        post={post}
        shareSheetOpen={shareSheetOpen}
        onCloseShareSheet={() => setShareSheetOpen(false)}
        repostOpen={repostOpen}
        onCloseRepost={() => setRepostOpen(false)}
        canRepost={canRepost}
        shareLoading={loading}
        onRepostSelect={handleRepostSelect}
        onStorySelect={handleStorySelect}
        onExternalShare={handleExternalShareSelect}
        onReposted={handleReposted}
        onOpenVideo={onOpenVideo}
      />
    </>
  );
});

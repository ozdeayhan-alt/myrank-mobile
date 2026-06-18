import { memo, useCallback, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import type { EngagementStatus } from "@/features/ranking/types";
import { SPINNER_COLOR, ui } from "@/lib/uiClasses";
import { usePostCardOwnerActions } from "../hooks/usePostCardOwnerActions";
import { useShareAndRepost } from "../hooks/useShareAndRepost";
import type { Post } from "../types";
import { isRepostPost } from "../utils/repostUtils";
import { EditPostTextModal } from "./EditPostTextModal";
import { PostCardActionBar } from "./PostCardActionBar";
import { PostCardBody } from "./PostCardBody";
import { useOpenCommentSheet } from "../hooks/useOpenCommentSheet";
import { PostHeader } from "./PostHeader";
import { RepostQuoteModal } from "./RepostQuoteModal";

type PostCardProps = {
  post: Post;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onOpenVideo?: (postId: string) => void;
  engagement?: EngagementStatus;
  onEngagementPatch?: (patch: Partial<EngagementStatus>) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  currentUserId?: string | null;
  mediaImagePriority?: "low" | "normal" | "high";
};

export const PostCard = memo(function PostCard({
  post,
  onScoreUpdate,
  onOpenVideo,
  engagement: externalEngagement,
  onEngagementPatch,
  onPostDeleted,
  onPostContentUpdated,
  currentUserId = null,
  mediaImagePriority = "normal",
}: PostCardProps) {
  const isOwner = Boolean(currentUserId && post.authorId === currentUserId);
  const [heartBurstKey, setHeartBurstKey] = useState(0);
  const openCommentSheet = useOpenCommentSheet();

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
    repostOpen,
    setRepostOpen,
    handleReposted,
  } = useShareAndRepost({
    post,
    currentUserId,
    engagement: externalEngagement,
    onEngagementPatch,
    onScoreUpdate,
  });

  const triggerLikeHeart = useCallback(() => {
    setHeartBurstKey((k) => k + 1);
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
          onOwnerMenuPress={handleOwnerMenuPress}
          onMoreMenuPress={!isOwner ? handleMoreMenuPress : undefined}
        />

        <PostCardBody
          post={displayPost}
          heartBurstKey={heartBurstKey}
          onLike={handleLike}
          onLikeAnimated={triggerLikeHeart}
          onOpenVideo={onOpenVideo}
          currentUserId={currentUserId}
          mediaImagePriority={mediaImagePriority}
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

      {!isRepostPost(post) && repostOpen ? (
        <RepostQuoteModal
          visible
          post={post}
          onClose={() => setRepostOpen(false)}
          onReposted={handleReposted}
          onOpenVideo={onOpenVideo}
        />
      ) : null}
    </>
  );
});

import { memo, useCallback, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import type { EngagementStatus } from "@/features/ranking/types";
import { SPINNER_COLOR, ui } from "@/lib/uiClasses";
import { useBonusPressHandlers } from "../hooks/useLikePressHandlers";
import { usePostCardOwnerActions } from "../hooks/usePostCardOwnerActions";
import { useShareAndRepost } from "../hooks/useShareAndRepost";
import type { Post } from "../types";
import { isRepostPost } from "../utils/repostUtils";
import { BonusPointsPicker } from "./LikePointsPicker";
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
    liked,
    disliked,
    handleLike,
    handleDislike,
    openLikeBonusPicker,
    closeLikeBonusPicker,
    applyLikeBonus,
    openDislikeBonusPicker,
    closeDislikeBonusPicker,
    applyDislikeBonus,
    likeBonusPickerOpen,
    dislikeBonusPickerOpen,
    likeBonusPoints,
    dislikeBonusPoints,
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

  const { onPress: handleLikePress, onLongPress: handleLikeLongPress } =
    useBonusPressHandlers({
      active: liked,
      onToggle: handleLike,
      onOpenBonusPicker: openLikeBonusPicker,
    });

  const { onPress: handleDislikePress, onLongPress: handleDislikeLongPress } =
    useBonusPressHandlers({
      active: disliked,
      onToggle: handleDislike,
      onOpenBonusPicker: openDislikeBonusPicker,
    });

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
          liked={liked}
          heartBurstKey={heartBurstKey}
          onLike={handleLike}
          onLikeAnimated={triggerLikeHeart}
          onOpenVideo={onOpenVideo}
          currentUserId={currentUserId}
          mediaImagePriority={mediaImagePriority}
        />

        <PostCardActionBar
          counts={counts}
          liked={liked}
          disliked={disliked}
          shareActive={shareActive}
          saveActive={saveActive}
          loading={loading}
          likeBonusPoints={likeBonusPoints}
          dislikeBonusPoints={dislikeBonusPoints}
          onLikePress={handleLikePress}
          onLikeLongPress={handleLikeLongPress}
          onDislikePress={handleDislikePress}
          onDislikeLongPress={handleDislikeLongPress}
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

      {likeBonusPickerOpen ? (
        <BonusPointsPicker
          variant="like"
          visible
          currentBonus={likeBonusPoints}
          submitting={loading}
          onSelect={applyLikeBonus}
          onClose={closeLikeBonusPicker}
        />
      ) : null}

      {dislikeBonusPickerOpen ? (
        <BonusPointsPicker
          variant="dislike"
          visible
          currentBonus={dislikeBonusPoints}
          submitting={loading}
          onSelect={applyDislikeBonus}
          onClose={closeDislikeBonusPicker}
        />
      ) : null}

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

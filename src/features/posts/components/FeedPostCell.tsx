import { memo, useCallback, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useRouter } from "expo-router";
import type { EngagementStatus } from "@/features/ranking/types";
import { SPINNER_COLOR, ui } from "@/lib/uiClasses";
import { useBonusPressHandlers } from "../hooks/useLikePressHandlers";
import { useOpenCommentSheet } from "../hooks/useOpenCommentSheet";
import { usePostCardOwnerActions } from "../hooks/usePostCardOwnerActions";
import { useShareAndRepost } from "../hooks/useShareAndRepost";
import type { Post } from "../types";
import { isRepostPost } from "../utils/repostUtils";
import { EditPostTextModal } from "./EditPostTextModal";
import { PostCardActionBar } from "./PostCardActionBar";
import { PostCardBody } from "./PostCardBody";
import { PostHeader } from "./PostHeader";
import { RepostQuoteModal } from "./RepostQuoteModal";

type FeedPostCellProps = {
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
}: FeedPostCellProps) {
  const router = useRouter();
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
    liked,
    disliked,
    handleLike,
    handleDislike,
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
    engagement,
    onEngagementPatch: patchEngagement,
    onScoreUpdate,
  });

  const openPostDetail = useCallback(() => {
    router.push(`/post/${post.id}`);
  }, [post.id, router]);

  const triggerLikeHeart = useCallback(() => {
    setHeartBurstKey((key) => key + 1);
  }, []);

  const { onPress: handleLikePress, onLongPress: handleLikeLongPress } =
    useBonusPressHandlers({
      active: liked,
      onToggle: handleLike,
      onOpenBonusPicker: openPostDetail,
    });

  const { onPress: handleDislikePress, onLongPress: handleDislikeLongPress } =
    useBonusPressHandlers({
      active: disliked,
      onToggle: handleDislike,
      onOpenBonusPicker: openPostDetail,
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
          onOwnerMenuPress={isOwner ? handleOwnerMenuPress : undefined}
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
          mediaImagePriority="high"
          inlineAutoplay={inlineAutoplay}
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

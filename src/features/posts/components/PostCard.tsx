import { memo } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import type { EngagementStatus } from "@/features/ranking/types";
import { SPINNER_COLOR, ui } from "@/lib/uiClasses";
import { usePostCardOwnerActions } from "../hooks/usePostCardOwnerActions";
import { usePostVoteFeedback } from "../hooks/usePostVoteFeedback";
import { useShareAndRepost } from "../hooks/useShareAndRepost";
import type { Post } from "../types";
import { EditPostTextModal } from "./EditPostTextModal";
import { PostCardActionBar } from "./PostCardActionBar";
import { PostCardBody } from "./PostCardBody";
import { PostCardOwnerSheets } from "./PostCardOwnerSheets";
import { useOpenCommentSheet } from "../hooks/useOpenCommentSheet";
import { PostHeader } from "./PostHeader";
import { PostShareModals } from "./PostShareModals";
import { PostVoteFountainLayer } from "./PostVoteFountainLayer";

type PostCardProps = {
  post: Post;
  onScoreUpdate?: (postId: string, postScore: number) => void;
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
  engagement: externalEngagement,
  onEngagementPatch,
  onPostDeleted,
  onPostContentUpdated,
  currentUserId = null,
  mediaImagePriority = "normal",
}: PostCardProps) {
  const isOwner = Boolean(currentUserId && post.authorId === currentUserId);
  const openCommentSheet = useOpenCommentSheet();
  const { fountainRef, triggerFeedback, buttonPulseSeq, lastButtonPulse } =
    usePostVoteFeedback();

  const {
    displayPost,
    editOpen,
    setEditOpen,
    ownerActionLoading,
    ownerMenuOpen,
    moreMenuOpen,
    deleteConfirmOpen,
    reportMenuOpen,
    setOwnerMenuOpen,
    setMoreMenuOpen,
    setDeleteConfirmOpen,
    setReportMenuOpen,
    handleOwnerMenuPress,
    handleMoreMenuPress,
    handleEditFromMenu,
    handleRequestDelete,
    handleOpenReportMenu,
    handleConfirmDelete,
    handleReportReason,
    handleEditSave,
  } = usePostCardOwnerActions({
    post,
    currentUserId,
    onPostDeleted,
    onPostContentUpdated,
  });

  const {
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
    handleExternalShareSelect,
  } = useShareAndRepost({
    post,
    currentUserId,
    engagement: externalEngagement,
    onEngagementPatch,
    onScoreUpdate,
  });

  return (
    <>
      <View
        className={ui.postCard}
        style={Platform.OS === "android" ? { elevation: 3, position: "relative" } : { position: "relative" }}
      >
        <PostHeader
          post={displayPost}
          isOwner={isOwner}
          currentUserId={currentUserId}
        />

        <PostCardBody
          post={displayPost}
          onLike={handleLike}
          onLikeAnimated={() => triggerFeedback("up")}
          currentUserId={currentUserId}
          mediaImagePriority={mediaImagePriority}
        />

        <PostCardActionBar
          counts={counts}
          shareActive={shareActive}
          saveActive={saveActive}
          loading={loading}
          onLikePress={() => {
            handleLike();
            triggerFeedback("up");
          }}
          onDislikePress={() => {
            handleDislike();
            triggerFeedback("down");
          }}
          onCommentPress={() =>
            openCommentSheet(post.id, applyCommentResult)
          }
          onSharePress={handleSharePress}
          onSavePress={handleSave}
          onMenuPress={
            isOwner ? handleOwnerMenuPress : handleMoreMenuPress
          }
          menuAccessibilityLabel="Gönderi seçenekleri"
          fountainRef={fountainRef}
          buttonPulseSeq={buttonPulseSeq}
          lastButtonPulse={lastButtonPulse}
        />

        {loading || ownerActionLoading ? (
          <View className="items-center py-2">
            <ActivityIndicator size="small" color={SPINNER_COLOR} />
          </View>
        ) : null}

        <PostVoteFountainLayer ref={fountainRef} />
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

      <PostCardOwnerSheets
        post={post}
        ownerMenuOpen={ownerMenuOpen}
        moreMenuOpen={moreMenuOpen}
        deleteConfirmOpen={deleteConfirmOpen}
        reportMenuOpen={reportMenuOpen}
        ownerActionLoading={ownerActionLoading}
        onCloseOwnerMenu={() => setOwnerMenuOpen(false)}
        onCloseMoreMenu={() => setMoreMenuOpen(false)}
        onCloseDeleteConfirm={() => setDeleteConfirmOpen(false)}
        onCloseReportMenu={() => setReportMenuOpen(false)}
        onEdit={handleEditFromMenu}
        onRequestDelete={handleRequestDelete}
        onConfirmDelete={() => void handleConfirmDelete()}
        onOpenReportMenu={handleOpenReportMenu}
        onReportReason={handleReportReason}
      />

      <PostShareModals
        post={post}
        shareSheetOpen={shareSheetOpen}
        onCloseShareSheet={() => setShareSheetOpen(false)}
        repostOpen={repostOpen}
        onCloseRepost={() => setRepostOpen(false)}
        canRepost={canRepost}
        shareLoading={loading}
        onRepostSelect={handleRepostSelect}
        onExternalShare={handleExternalShareSelect}
        onReposted={handleReposted}
      />
    </>
  );
}, (prev, next) => {
  return (
    prev.post.id === next.post.id &&
    prev.post.content === next.post.content &&
    prev.post.contentType === next.post.contentType &&
    prev.post.authorId === next.post.authorId &&
    prev.currentUserId === next.currentUserId &&
    prev.engagement === next.engagement &&
    prev.mediaImagePriority === next.mediaImagePriority &&
    prev.onScoreUpdate === next.onScoreUpdate &&
    prev.onEngagementPatch === next.onEngagementPatch &&
    prev.onPostDeleted === next.onPostDeleted &&
    prev.onPostContentUpdated === next.onPostContentUpdated
  );
});

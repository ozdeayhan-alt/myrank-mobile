import { memo } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import type { EngagementStatus } from "@/features/ranking/types";
import { SPINNER_COLOR, ui } from "@/lib/uiClasses";
import { useOpenCommentSheet } from "../hooks/useOpenCommentSheet";
import { usePostCardOwnerActions } from "../hooks/usePostCardOwnerActions";
import { usePostVoteFeedback } from "../hooks/usePostVoteFeedback";
import { useShareAndRepost } from "../hooks/useShareAndRepost";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";
import type { Post } from "../types";
import { EditPostTextModal } from "./EditPostTextModal";
import { PostCardActionBar } from "./PostCardActionBar";
import { PostCardBody } from "./PostCardBody";
import { PostCardOwnerSheets } from "./PostCardOwnerSheets";
import { PostHeader } from "./PostHeader";
import { PostShareModals } from "./PostShareModals";
import { PostVoteFountainLayer } from "./PostVoteFountainLayer";

type FeedPostCellProps = PostFeedMediaLayoutOptions & {
  post: Post;
  engagement: EngagementStatus;
  patchEngagement: (patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  currentUserId?: string | null;
};

export const FeedPostCell = memo(function FeedPostCell({
  post,
  engagement,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
  currentUserId = null,
  listHorizontalInset,
  mediaEdgeBleed,
}: FeedPostCellProps) {
  const openCommentSheet = useOpenCommentSheet();
  const isOwner = Boolean(currentUserId && post.authorId === currentUserId);
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
    engagement,
    onEngagementPatch: patchEngagement,
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
          mediaImagePriority="high"
          listHorizontalInset={listHorizontalInset}
          mediaEdgeBleed={mediaEdgeBleed}
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
});

import { memo } from "react";
import { ActivityIndicator, View } from "react-native";
import { DoubleTapToLike } from "@/components/DoubleTapToLike";
import { SPINNER_COLOR } from "@/lib/uiClasses";
import { EditPostTextModal } from "@/features/posts/components/EditPostTextModal";
import { PostCardActionBar } from "@/features/posts/components/PostCardActionBar";
import { PostCardOwnerSheets } from "@/features/posts/components/PostCardOwnerSheets";
import { PostHeader } from "@/features/posts/components/PostHeader";
import { PostShareModals } from "@/features/posts/components/PostShareModals";
import { PostVoteFountainLayer } from "@/features/posts/components/PostVoteFountainLayer";
import { WHISP_BODY_TEXT_CLASS } from "@/features/posts/constants/whispTypography";
import { usePostVoteFeedback } from "@/features/posts/hooks/usePostVoteFeedback";
import { RichPostText } from "@/features/posts/components/RichPostText";
import { WhispLinkCard } from "@/features/posts/components/WhispLinkCard";
import { postBodyText } from "@/features/posts/utils/postBodyText";
import { FeedCellShell } from "./FeedCellShell";
import type { FeedRowInteractionState } from "./useFeedRowInteractions";

type FeedRowChromeProps = {
  row: FeedRowInteractionState;
  currentUserId?: string | null;
  children?: React.ReactNode;
  bodyAbove?: React.ReactNode;
  bodyBelow?: React.ReactNode;
  accessibilityLabel?: string;
};

function FeedRowChromeInner({
  row,
  currentUserId = null,
  children,
  bodyAbove,
  bodyBelow,
  accessibilityLabel = "Çift dokunarak beğen",
}: FeedRowChromeProps) {
  const bodyText = postBodyText(row.displayPost);
  const { fountainRef, triggerFeedback, buttonPulseSeq, lastButtonPulse } =
    usePostVoteFeedback();

  return (
    <>
      <FeedCellShell>
        <PostHeader
          post={row.displayPost}
          isOwner={row.isOwner}
          currentUserId={currentUserId}
        />

        <DoubleTapToLike
          onLike={row.handleLike}
          onLikeAnimated={() => triggerFeedback("up")}
          accessibilityLabel={accessibilityLabel}
        >
          {bodyAbove}
          {bodyText && !bodyAbove ? (
            <View className="px-4 pb-3">
              <RichPostText
                content={bodyText}
                className={WHISP_BODY_TEXT_CLASS}
                currentUserId={currentUserId}
              />
            </View>
          ) : null}
          <WhispLinkCard post={row.displayPost} />
          {children}
          {bodyBelow}
        </DoubleTapToLike>

        <PostCardActionBar
          counts={row.counts}
          shareActive={row.shareActive}
          saveActive={row.saveActive}
          loading={row.loading}
          onLikePress={() => {
            row.handleLike();
            triggerFeedback("up");
          }}
          onDislikePress={() => {
            row.handleDislike();
            triggerFeedback("down");
          }}
          onCommentPress={row.openComment}
          onSharePress={row.handleSharePress}
          onSavePress={row.handleSave}
          onMenuPress={
            row.isOwner ? row.openOwnerMenu : row.openMoreMenu
          }
          menuAccessibilityLabel="Gönderi seçenekleri"
          fountainRef={fountainRef}
          buttonPulseSeq={buttonPulseSeq}
          lastButtonPulse={lastButtonPulse}
        />

        {row.loading || row.ownerActionLoading ? (
          <View className="items-center py-2">
            <ActivityIndicator size="small" color={SPINNER_COLOR} />
          </View>
        ) : null}

        <PostVoteFountainLayer ref={fountainRef} />
      </FeedCellShell>

      {row.editOpen ? (
        <EditPostTextModal
          visible
          contentType={row.post.contentType ?? "tweet"}
          initialContent={row.displayPost.content ?? ""}
          submitting={row.ownerActionLoading}
          onClose={() => row.setEditOpen(false)}
          onSave={row.handleEditSave}
        />
      ) : null}

      <PostCardOwnerSheets
        post={row.post}
        ownerMenuOpen={row.ownerMenuOpen}
        moreMenuOpen={row.moreMenuOpen}
        deleteConfirmOpen={row.deleteConfirmOpen}
        reportMenuOpen={row.reportMenuOpen}
        ownerActionLoading={row.ownerActionLoading}
        onCloseOwnerMenu={() => row.setOwnerMenuOpen(false)}
        onCloseMoreMenu={() => row.setMoreMenuOpen(false)}
        onCloseDeleteConfirm={() => row.setDeleteConfirmOpen(false)}
        onCloseReportMenu={() => row.setReportMenuOpen(false)}
        onEdit={row.handleEditFromMenu}
        onRequestDelete={row.handleRequestDelete}
        onConfirmDelete={() => void row.handleConfirmDelete()}
        onOpenReportMenu={row.handleOpenReportMenu}
        onReportReason={row.handleReportReason}
      />

      <PostShareModals
        post={row.post}
        shareSheetOpen={row.shareSheetOpen}
        onCloseShareSheet={() => row.setShareSheetOpen(false)}
        repostOpen={row.repostOpen}
        onCloseRepost={() => row.setRepostOpen(false)}
        canRepost={row.canRepost}
        shareLoading={row.loading}
        onRepostSelect={row.handleRepostSelect}
        onExternalShare={row.handleExternalShareSelect}
        onReposted={row.handleReposted}
      />
    </>
  );
}

export const FeedRowChrome = memo(FeedRowChromeInner);

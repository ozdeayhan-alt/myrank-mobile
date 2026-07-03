import { ActivityIndicator, View } from "react-native";
import { DoubleTapToLike } from "@/components/DoubleTapToLike";
import { LikeHeartBurst } from "@/components/LikeHeartBurst";
import { SPINNER_COLOR } from "@/lib/uiClasses";
import { EditPostTextModal } from "@/features/posts/components/EditPostTextModal";
import { PostCardActionBar } from "@/features/posts/components/PostCardActionBar";
import { PostCardOwnerSheets } from "@/features/posts/components/PostCardOwnerSheets";
import { PostHeader } from "@/features/posts/components/PostHeader";
import { PostShareModals } from "@/features/posts/components/PostShareModals";
import { RichPostText } from "@/features/posts/components/RichPostText";
import { postBodyText } from "@/features/posts/utils/postBodyText";
import { FeedCellShell } from "./FeedCellShell";
import type { FeedRowInteractionState } from "./useFeedRowInteractions";

type FeedRowChromeProps = {
  row: FeedRowInteractionState;
  currentUserId?: string | null;
  children?: React.ReactNode;
  bodyAbove?: React.ReactNode;
  bodyBelow?: React.ReactNode;
  onSinglePress?: () => void;
  accessibilityLabel?: string;
};

export function FeedRowChrome({
  row,
  currentUserId = null,
  children,
  bodyAbove,
  bodyBelow,
  onSinglePress,
  accessibilityLabel = "Çift dokunarak beğen",
}: FeedRowChromeProps) {
  const bodyText = postBodyText(row.displayPost);

  return (
    <>
      <FeedCellShell>
        <PostHeader
          post={row.displayPost}
          score={row.score}
          isOwner={row.isOwner}
          currentUserId={currentUserId}
          onOwnerMenuPress={row.isOwner ? row.openOwnerMenu : undefined}
          onMoreMenuPress={!row.isOwner ? row.openMoreMenu : undefined}
        />

        <DoubleTapToLike
          onLike={row.handleLikePress}
          onLikeAnimated={row.handleLikeAnimated}
          onSinglePress={onSinglePress}
          accessibilityLabel={accessibilityLabel}
        >
          {bodyAbove}
          {bodyText && !bodyAbove ? (
            <View className="px-4 pb-3">
              <RichPostText content={bodyText} currentUserId={currentUserId} />
            </View>
          ) : null}
          {children}
          {bodyBelow}
        </DoubleTapToLike>

        <PostCardActionBar
          counts={row.counts}
          shareActive={row.shareActive}
          saveActive={row.saveActive}
          loading={row.loading}
          onLikePress={row.handleLikePress}
          onDislikePress={row.handleDislikePress}
          onCommentPress={row.openComment}
          onSharePress={row.handleSharePress}
          onSavePress={row.handleSave}
        />

        {row.loading || row.ownerActionLoading ? (
          <View className="items-center py-2">
            <ActivityIndicator size="small" color={SPINNER_COLOR} />
          </View>
        ) : null}

        <LikeHeartBurst
          burstKey={row.voteBurstKey}
          direction={row.voteBurstDirection}
        />
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

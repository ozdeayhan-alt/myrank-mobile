import type { VoteBurstDirection } from "@/components/LikeHeartBurst";
import { useCallback, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { DoubleTapToLike } from "@/components/DoubleTapToLike";
import { SPINNER_COLOR } from "@/lib/uiClasses";
import { EditPostTextModal } from "@/features/posts/components/EditPostTextModal";
import { PostCardActionBar } from "@/features/posts/components/PostCardActionBar";
import { PostCardOwnerSheets } from "@/features/posts/components/PostCardOwnerSheets";
import { PostHeader } from "@/features/posts/components/PostHeader";
import { PostShareModals } from "@/features/posts/components/PostShareModals";
import {
  PostVoteBurstLayer,
  type PostVoteBurstHandle,
} from "@/features/posts/components/PostVoteBurstLayer";
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
  accessibilityLabel?: string;
};

export function FeedRowChrome({
  row,
  currentUserId = null,
  children,
  bodyAbove,
  bodyBelow,
  accessibilityLabel = "Çift dokunarak beğen",
}: FeedRowChromeProps) {
  const bodyText = postBodyText(row.displayPost);
  const burstRef = useRef<PostVoteBurstHandle>(null);

  const triggerVoteBurst = useCallback((direction: VoteBurstDirection) => {
    burstRef.current?.trigger(direction);
  }, []);

  const handleLikePress = useCallback(() => {
    row.handleLike();
    triggerVoteBurst("up");
  }, [row.handleLike, triggerVoteBurst]);

  const handleDislikePress = useCallback(() => {
    row.handleDislike();
    triggerVoteBurst("down");
  }, [row.handleDislike, triggerVoteBurst]);

  const handleLikeAnimated = useCallback(() => {
    triggerVoteBurst("up");
  }, [triggerVoteBurst]);

  return (
    <>
      <FeedCellShell>
        <PostHeader
          post={row.displayPost}
          isOwner={row.isOwner}
          currentUserId={currentUserId}
          onOwnerMenuPress={row.isOwner ? row.openOwnerMenu : undefined}
          onMoreMenuPress={!row.isOwner ? row.openMoreMenu : undefined}
        />

        <DoubleTapToLike
          onLike={row.handleLike}
          onLikeAnimated={handleLikeAnimated}
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
          onLikePress={handleLikePress}
          onDislikePress={handleDislikePress}
          onCommentPress={row.openComment}
          onSharePress={row.handleSharePress}
          onSavePress={row.handleSave}
        />

        {row.loading || row.ownerActionLoading ? (
          <View className="items-center py-2">
            <ActivityIndicator size="small" color={SPINNER_COLOR} />
          </View>
        ) : null}

        <PostVoteBurstLayer ref={burstRef} />
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

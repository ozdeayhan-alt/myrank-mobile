import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { usePostEngagement } from "@/features/ranking/store/useEngagementStore";
import type { EngagementStatus } from "@/features/ranking/types";
import { useFeedRefreshStore } from "../store/useFeedRefreshStore";
import { useFeedInteractionStore } from "../store/useFeedInteractionStore";
import { usePostCardOwnerActions } from "../hooks/usePostCardOwnerActions";
import { usePostInteractions } from "../hooks/usePostInteractions";
import { canRepostPost } from "../utils/repostUtils";
import type { Post } from "../types";
import { EditPostTextModal } from "./EditPostTextModal";
import { PostCardOwnerSheets } from "./PostCardOwnerSheets";
import { PostShareModals } from "./PostShareModals";

type FeedInteractionHostInnerProps = {
  post: Post;
  currentUserId?: string | null;
  patchEngagement: (
    postId: string,
    patch: Partial<EngagementStatus>
  ) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
};

function FeedInteractionHostInner({
  post,
  currentUserId = null,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
}: FeedInteractionHostInnerProps) {
  const bumpFeed = useFeedRefreshStore((s) => s.bump);

  const {
    shareSheetOpen,
    repostOpen,
    ownerMenuOpen,
    moreMenuOpen,
    deleteConfirmOpen,
    reportMenuOpen,
    editOpen,
    setShareSheetOpen,
    setRepostOpen,
    setOwnerMenuOpen,
    setMoreMenuOpen,
    setDeleteConfirmOpen,
    setReportMenuOpen,
    setEditOpen,
  } = useFeedInteractionStore(
    useShallow((s) => ({
      shareSheetOpen: s.shareSheetOpen,
      repostOpen: s.repostOpen,
      ownerMenuOpen: s.ownerMenuOpen,
      moreMenuOpen: s.moreMenuOpen,
      deleteConfirmOpen: s.deleteConfirmOpen,
      reportMenuOpen: s.reportMenuOpen,
      editOpen: s.editOpen,
      setShareSheetOpen: s.setShareSheetOpen,
      setRepostOpen: s.setRepostOpen,
      setOwnerMenuOpen: s.setOwnerMenuOpen,
      setMoreMenuOpen: s.setMoreMenuOpen,
      setDeleteConfirmOpen: s.setDeleteConfirmOpen,
      setReportMenuOpen: s.setReportMenuOpen,
      setEditOpen: s.setEditOpen,
    }))
  );

  const engagement = usePostEngagement(post.id);

  const handlePatch = useCallback(
    (patch: Partial<EngagementStatus>) => {
      patchEngagement(post.id, patch);
    },
    [patchEngagement, post.id]
  );

  const {
    displayPost,
    ownerActionLoading,
    handleEditSave,
    handleConfirmDelete,
    handleReportReason,
  } = usePostCardOwnerActions({
    post,
    currentUserId,
    onPostDeleted,
    onPostContentUpdated,
  });

  const { loading, handleExternalShare } = usePostInteractions({
    post,
    currentUserId,
    engagement,
    onEngagementPatch: handlePatch,
    onScoreUpdate,
  });

  const canRepost = canRepostPost(post, currentUserId ?? undefined);

  const handleRepostSelect = useCallback(() => {
    setShareSheetOpen(false);
    setRepostOpen(true);
  }, [setRepostOpen, setShareSheetOpen]);

  const handleExternalShareSelect = useCallback(() => {
    setShareSheetOpen(false);
    void handleExternalShare();
  }, [handleExternalShare, setShareSheetOpen]);

  const handleReposted = useCallback(() => {
    bumpFeed();
  }, [bumpFeed]);

  return (
    <>
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
        onEdit={() => {
          setOwnerMenuOpen(false);
          setEditOpen(true);
        }}
        onRequestDelete={() => {
          setOwnerMenuOpen(false);
          setDeleteConfirmOpen(true);
        }}
        onConfirmDelete={() => void handleConfirmDelete()}
        onOpenReportMenu={() => {
          setMoreMenuOpen(false);
          setReportMenuOpen(true);
        }}
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
}

type FeedInteractionHostProps = Omit<FeedInteractionHostInnerProps, "post">;

export function FeedInteractionHost(props: FeedInteractionHostProps) {
  const post = useFeedInteractionStore((state) => state.post);

  if (!post) {
    return null;
  }

  return <FeedInteractionHostInner post={post} {...props} />;
}

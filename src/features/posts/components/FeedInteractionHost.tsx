import { useCallback } from "react";
import { useRouter } from "expo-router";
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
  onOpenVideo?: (postId: string) => void;
};

function FeedInteractionHostInner({
  post,
  currentUserId = null,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
  onOpenVideo,
}: FeedInteractionHostInnerProps) {
  const router = useRouter();
  const bumpFeed = useFeedRefreshStore((s) => s.bump);

  const shareSheetOpen = useFeedInteractionStore((s) => s.shareSheetOpen);
  const repostOpen = useFeedInteractionStore((s) => s.repostOpen);
  const ownerMenuOpen = useFeedInteractionStore((s) => s.ownerMenuOpen);
  const moreMenuOpen = useFeedInteractionStore((s) => s.moreMenuOpen);
  const deleteConfirmOpen = useFeedInteractionStore((s) => s.deleteConfirmOpen);
  const reportMenuOpen = useFeedInteractionStore((s) => s.reportMenuOpen);
  const editOpen = useFeedInteractionStore((s) => s.editOpen);
  const setShareSheetOpen = useFeedInteractionStore((s) => s.setShareSheetOpen);
  const setRepostOpen = useFeedInteractionStore((s) => s.setRepostOpen);
  const setOwnerMenuOpen = useFeedInteractionStore((s) => s.setOwnerMenuOpen);
  const setMoreMenuOpen = useFeedInteractionStore((s) => s.setMoreMenuOpen);
  const setDeleteConfirmOpen = useFeedInteractionStore(
    (s) => s.setDeleteConfirmOpen
  );
  const setReportMenuOpen = useFeedInteractionStore((s) => s.setReportMenuOpen);
  const setEditOpen = useFeedInteractionStore((s) => s.setEditOpen);

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

  const handleStorySelect = useCallback(() => {
    setShareSheetOpen(false);
    router.push({
      pathname: "/stories/share-from-post",
      params: { postId: post.id },
    });
  }, [post.id, router, setShareSheetOpen]);

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
        onStorySelect={handleStorySelect}
        onExternalShare={handleExternalShareSelect}
        onReposted={handleReposted}
        onOpenVideo={onOpenVideo}
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

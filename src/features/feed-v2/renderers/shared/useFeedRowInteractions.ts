import { useCallback, useMemo } from "react";
import type { ReportReason } from "@/features/blocks/api/reportContent";
import { usePostEngagement } from "@/features/ranking/store/useEngagementStore";
import type { EngagementStatus } from "@/features/ranking/types";
import { useOpenCommentSheet } from "@/features/posts/hooks/useOpenCommentSheet";
import { usePostCardOwnerActions } from "@/features/posts/hooks/usePostCardOwnerActions";
import { usePostInteractions } from "@/features/posts/hooks/usePostInteractions";
import { useShareAndRepost } from "@/features/posts/hooks/useShareAndRepost";
import { useFeedInteractionStore } from "@/features/posts/store/useFeedInteractionStore";
import type { Post } from "@/features/posts/types";

export type FeedRowInteractionState = {
  post: Post;
  displayPost: Post;
  engagement: EngagementStatus;
  counts: ReturnType<typeof usePostInteractions>["counts"];
  loading: boolean;
  shareActive: boolean;
  saveActive: boolean;
  isOwner: boolean;
  ownerActionLoading: boolean;
  ownerMenuOpen: boolean;
  moreMenuOpen: boolean;
  deleteConfirmOpen: boolean;
  reportMenuOpen: boolean;
  editOpen: boolean;
  shareSheetOpen: boolean;
  repostOpen: boolean;
  canRepost: boolean;
  handleLike: () => void;
  handleDislike: () => void;
  handleSave: () => void;
  handleSharePress: () => void;
  openComment: () => void;
  openShare: () => void;
  openOwnerMenu: () => void;
  openMoreMenu: () => void;
  setEditOpen: (open: boolean) => void;
  setShareSheetOpen: (open: boolean) => void;
  setRepostOpen: (open: boolean) => void;
  handleEditFromMenu: () => void;
  handleRequestDelete: () => void;
  handleConfirmDelete: () => void;
  handleOpenReportMenu: () => void;
  handleReportReason: (reason: ReportReason) => void;
  handleEditSave: (content: string) => Promise<void>;
  handleRepostSelect: () => void;
  handleExternalShareSelect: () => void;
  handleReposted: () => void;
  setOwnerMenuOpen: (open: boolean) => void;
  setMoreMenuOpen: (open: boolean) => void;
  setDeleteConfirmOpen: (open: boolean) => void;
  setReportMenuOpen: (open: boolean) => void;
  patchEngagement: (patch: Partial<EngagementStatus>) => void;
};

type UseFeedRowInteractionsOptions = {
  post: Post;
  currentUserId?: string | null;
  patchEngagement: (patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
};

export function useFeedRowInteractions({
  post,
  currentUserId = null,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
}: UseFeedRowInteractionsOptions): FeedRowInteractionState {
  const engagement = usePostEngagement(post.id);
  const openCommentSheet = useOpenCommentSheet();
  const openShareStore = useFeedInteractionStore((s) => s.openShare);

  const isOwner = Boolean(currentUserId && post.authorId === currentUserId);

  const owner = usePostCardOwnerActions({
    post,
    currentUserId,
    onPostDeleted,
    onPostContentUpdated,
  });

  const handlePatch = useCallback(
    (patch: Partial<EngagementStatus>) => {
      patchEngagement(patch);
    },
    [patchEngagement]
  );

  const {
    counts,
    loading,
    handleLike,
    handleDislike,
    handleSave,
    applyCommentResult,
    shareActive,
    saveActive,
  } = usePostInteractions({
    post,
    currentUserId,
    engagement,
    onEngagementPatch: handlePatch,
    onScoreUpdate,
  });

  const share = useShareAndRepost({
    post,
    currentUserId,
    engagement,
    onEngagementPatch: handlePatch,
    onScoreUpdate,
  });

  const openComment = useCallback(() => {
    openCommentSheet(post.id, applyCommentResult);
  }, [openCommentSheet, post.id, applyCommentResult]);

  const openShare = useCallback(() => {
    openShareStore(post);
  }, [openShareStore, post]);

  // Use local owner-action state so PostCardOwnerSheets in this row opens.
  // Global store menus are for legacy FeedInteractionHost only.
  const openOwnerMenu = owner.handleOwnerMenuPress;
  const openMoreMenu = owner.handleMoreMenuPress;

  return useMemo(
    () => ({
      post,
      displayPost: owner.displayPost,
      engagement,
      counts,
      loading,
      shareActive,
      saveActive,
      isOwner,
      ownerActionLoading: owner.ownerActionLoading,
      ownerMenuOpen: owner.ownerMenuOpen,
      moreMenuOpen: owner.moreMenuOpen,
      deleteConfirmOpen: owner.deleteConfirmOpen,
      reportMenuOpen: owner.reportMenuOpen,
      editOpen: owner.editOpen,
      shareSheetOpen: share.shareSheetOpen,
      repostOpen: share.repostOpen,
      canRepost: share.canRepost,
      handleLike,
      handleDislike,
      handleSave,
      handleSharePress: share.handleSharePress,
      openComment,
      openShare,
      openOwnerMenu,
      openMoreMenu,
      setEditOpen: owner.setEditOpen,
      setShareSheetOpen: share.setShareSheetOpen,
      setRepostOpen: share.setRepostOpen,
      handleEditFromMenu: owner.handleEditFromMenu,
      handleRequestDelete: owner.handleRequestDelete,
      handleConfirmDelete: owner.handleConfirmDelete,
      handleOpenReportMenu: owner.handleOpenReportMenu,
      handleReportReason: owner.handleReportReason,
      handleEditSave: owner.handleEditSave,
      handleRepostSelect: share.handleRepostSelect,
      handleExternalShareSelect: share.handleExternalShareSelect,
      handleReposted: share.handleReposted,
      setOwnerMenuOpen: owner.setOwnerMenuOpen,
      setMoreMenuOpen: owner.setMoreMenuOpen,
      setDeleteConfirmOpen: owner.setDeleteConfirmOpen,
      setReportMenuOpen: owner.setReportMenuOpen,
      patchEngagement: handlePatch,
    }),
    [
      post,
      owner.displayPost,
      owner.ownerActionLoading,
      owner.ownerMenuOpen,
      owner.moreMenuOpen,
      owner.deleteConfirmOpen,
      owner.reportMenuOpen,
      owner.editOpen,
      owner.setEditOpen,
      owner.handleEditFromMenu,
      owner.handleRequestDelete,
      owner.handleConfirmDelete,
      owner.handleOpenReportMenu,
      owner.handleReportReason,
      owner.handleEditSave,
      owner.setOwnerMenuOpen,
      owner.setMoreMenuOpen,
      owner.setDeleteConfirmOpen,
      owner.setReportMenuOpen,
      engagement,
      counts,
      loading,
      shareActive,
      saveActive,
      isOwner,
      share.shareSheetOpen,
      share.repostOpen,
      share.canRepost,
      share.handleSharePress,
      share.setShareSheetOpen,
      share.setRepostOpen,
      share.handleRepostSelect,
      share.handleExternalShareSelect,
      share.handleReposted,
      handleLike,
      handleDislike,
      handleSave,
      openComment,
      openShare,
      openOwnerMenu,
      openMoreMenu,
      handlePatch,
    ]
  );
}

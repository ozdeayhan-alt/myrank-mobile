import type { VoteBurstDirection } from "@/components/LikeHeartBurst";
import { useCallback, useState } from "react";
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
  score: number;
  counts: ReturnType<typeof usePostInteractions>["counts"];
  loading: boolean;
  shareActive: boolean;
  saveActive: boolean;
  isOwner: boolean;
  voteBurstKey: number;
  voteBurstDirection: VoteBurstDirection;
  ownerActionLoading: boolean;
  ownerMenuOpen: boolean;
  moreMenuOpen: boolean;
  deleteConfirmOpen: boolean;
  reportMenuOpen: boolean;
  editOpen: boolean;
  shareSheetOpen: boolean;
  repostOpen: boolean;
  canRepost: boolean;
  handleLikePress: () => void;
  handleDislikePress: () => void;
  handleLikeAnimated: () => void;
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
  const openOwnerMenuStore = useFeedInteractionStore((s) => s.openOwnerMenu);
  const openMoreMenuStore = useFeedInteractionStore((s) => s.openMoreMenu);

  const [voteBurstKey, setVoteBurstKey] = useState(0);
  const [voteBurstDirection, setVoteBurstDirection] =
    useState<VoteBurstDirection>("up");

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
    score,
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

  const triggerVoteBurst = useCallback((direction: VoteBurstDirection) => {
    setVoteBurstDirection(direction);
    setVoteBurstKey((key) => key + 1);
  }, []);

  const handleLikePress = useCallback(() => {
    handleLike();
    triggerVoteBurst("up");
  }, [handleLike, triggerVoteBurst]);

  const handleDislikePress = useCallback(() => {
    handleDislike();
    triggerVoteBurst("down");
  }, [handleDislike, triggerVoteBurst]);

  return {
    post,
    displayPost: owner.displayPost,
    engagement,
    score,
    counts,
    loading,
    shareActive,
    saveActive,
    isOwner,
    voteBurstKey,
    voteBurstDirection,
    ownerActionLoading: owner.ownerActionLoading,
    ownerMenuOpen: owner.ownerMenuOpen,
    moreMenuOpen: owner.moreMenuOpen,
    deleteConfirmOpen: owner.deleteConfirmOpen,
    reportMenuOpen: owner.reportMenuOpen,
    editOpen: owner.editOpen,
    shareSheetOpen: share.shareSheetOpen,
    repostOpen: share.repostOpen,
    canRepost: share.canRepost,
    handleLikePress,
    handleDislikePress,
    handleLikeAnimated: () => triggerVoteBurst("up"),
    handleSave,
    handleSharePress: share.handleSharePress,
    openComment: () => openCommentSheet(post.id, applyCommentResult),
    openShare: () => openShareStore(post),
    openOwnerMenu: () => openOwnerMenuStore(post),
    openMoreMenu: () => openMoreMenuStore(post),
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
  };
}

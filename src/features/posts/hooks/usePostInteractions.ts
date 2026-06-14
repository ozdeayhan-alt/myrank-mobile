import { useCallback, useEffect, useMemo, useState } from "react";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { sendPostInteractionSafe } from "@/features/ranking/api/sendPostInteraction";
import { useUserEngagement } from "@/features/ranking/hooks/useUserEngagement";
import { useVoteSession } from "@/features/ranking/hooks/useVoteSession";
import type { EngagementStatus, PostCounts } from "@/features/ranking/types";
import type { Post } from "../types";
import { usePostInteractionContext } from "../context/PostInteractionContext";
import { usePostBonusHandlers } from "./usePostBonusHandlers";
import { usePostShareActions } from "./usePostShareActions";

type UsePostInteractionsOptions = {
  post: Post;
  currentUserId?: string | null;
  engagement?: EngagementStatus;
  onEngagementPatch?: (patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
};

export function usePostInteractions({
  post,
  currentUserId = null,
  engagement: externalEngagement,
  onEngagementPatch,
  onScoreUpdate,
}: UsePostInteractionsOptions) {
  const interactionContext = usePostInteractionContext();
  const setAuthorTotalScore = useProfileStore((s) => s.setTotalScore);

  const fallbackSendInteraction = useCallback(
    async (request: Parameters<NonNullable<typeof interactionContext>["sendInteraction"]>[0]) => {
      const result = await sendPostInteractionSafe(request);
      if (result && currentUserId && result.authorId === currentUserId) {
        setAuthorTotalScore(result.authorTotalScore);
      }
      return result;
    },
    [currentUserId, setAuthorTotalScore]
  );

  const sendInteraction =
    interactionContext?.sendInteraction ?? fallbackSendInteraction;

  const fetchedEngagement = useUserEngagement(
    externalEngagement !== undefined ? null : post.id
  );
  const baseEngagement = externalEngagement ?? fetchedEngagement.engagement;

  const initialCounts = useMemo<PostCounts>(
    () => ({
      likeCount: post.likeCount,
      dislikeCount: post.dislikeCount,
      shareCount: post.shareCount,
      saveCount: post.saveCount ?? 0,
      commentCount: post.commentCount,
    }),
    [
      post.likeCount,
      post.dislikeCount,
      post.shareCount,
      post.saveCount,
      post.commentCount,
    ]
  );

  const voteSession = useVoteSession({
    postId: post.id,
    authorId: post.authorId,
    initialCounts,
    initialPostScore: post.postScore,
    initialLikeBonusTotal: post.likeBonusTotal ?? 0,
    initialDislikeBonusTotal: post.dislikeBonusTotal ?? 0,
    initialEngagement: baseEngagement,
    onEngagementPatch,
    onScoreUpdate,
  });

  const [counts, setCounts] = useState<PostCounts>(initialCounts);

  useEffect(() => {
    setCounts({
      likeCount: post.likeCount,
      dislikeCount: post.dislikeCount,
      shareCount: post.shareCount,
      saveCount: post.saveCount ?? 0,
      commentCount: post.commentCount,
    });
  }, [
    post.id,
    post.likeCount,
    post.dislikeCount,
    post.shareCount,
    post.saveCount,
    post.commentCount,
  ]);

  const applyResult = useCallback(
    (result: NonNullable<Awaited<ReturnType<typeof sendInteraction>>>) => {
      setCounts(result.counts);
      onScoreUpdate?.(post.id, result.postScore);

      if (result.engagement) {
        onEngagementPatch?.({
          liked: result.engagement.liked,
          disliked: result.engagement.disliked,
          shared: result.engagement.shared,
          saved: result.engagement.saved,
        });
      }
    },
    [onEngagementPatch, onScoreUpdate, post.id]
  );

  const bonus = usePostBonusHandlers({
    postId: post.id,
    currentUserId,
    voteSession,
    baseEngagement,
    onEngagementPatch,
    onScoreUpdate,
  });

  const markShared = useCallback(() => {
    if (onEngagementPatch) {
      onEngagementPatch({ shared: true });
    } else {
      fetchedEngagement.markShared();
    }
  }, [fetchedEngagement, onEngagementPatch]);

  const markSaved = useCallback(() => {
    if (onEngagementPatch) {
      onEngagementPatch({ saved: true });
    } else {
      fetchedEngagement.markSaved();
    }
  }, [fetchedEngagement, onEngagementPatch]);

  const share = usePostShareActions({
    post,
    sendInteraction,
    applyResult,
    markShared,
    markSaved,
  });

  const handleLike = useCallback(() => {
    voteSession.registerLikeTap();
  }, [voteSession]);

  const handleDislike = useCallback(() => {
    voteSession.registerDislikeTap();
  }, [voteSession]);

  const loading =
    bonus.actionLoading || share.commentLoading || share.shareSaveLoading;

  const displayCounts: PostCounts = {
    ...counts,
    likeCount: voteSession.counts.likeCount,
    dislikeCount: voteSession.counts.dislikeCount,
  };

  const engagement = useMemo<EngagementStatus>(
    () => ({
      shared: baseEngagement.shared,
      saved: baseEngagement.saved,
      liked: voteSession.liked,
      disliked: voteSession.disliked,
      likeBonusPoints: bonus.likeBonusPoints,
      dislikeBonusPoints: bonus.dislikeBonusPoints,
    }),
    [
      baseEngagement.shared,
      baseEngagement.saved,
      voteSession.liked,
      voteSession.disliked,
      bonus.likeBonusPoints,
      bonus.dislikeBonusPoints,
    ]
  );

  return {
    score: voteSession.score,
    counts: displayCounts,
    engagement,
    loading,
    liked: voteSession.liked,
    disliked: voteSession.disliked,
    likeBonusPoints: bonus.likeBonusPoints,
    dislikeBonusPoints: bonus.dislikeBonusPoints,
    likeBonusPickerOpen: bonus.likeBonusPickerOpen,
    dislikeBonusPickerOpen: bonus.dislikeBonusPickerOpen,
    handleLike,
    handleDislike,
    openLikeBonusPicker: bonus.openLikeBonusPicker,
    closeLikeBonusPicker: bonus.closeLikeBonusPicker,
    applyLikeBonus: bonus.applyLikeBonus,
    openDislikeBonusPicker: bonus.openDislikeBonusPicker,
    closeDislikeBonusPicker: bonus.closeDislikeBonusPicker,
    applyDislikeBonus: bonus.applyDislikeBonus,
    handleExternalShare: share.handleExternalShare,
    handleShare: share.handleShare,
    handleSave: share.handleSave,
    submitComment: share.submitComment,
    applyCommentResult: applyResult,
    shareActive: engagement.shared,
    saveActive: engagement.saved,
  };
}

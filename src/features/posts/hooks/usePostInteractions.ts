import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { patchPublicProfileTotalScore } from "@/features/profile/lib/patchPublicProfileTotalScore";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { sendPostInteractionSafe } from "@/features/ranking/api/sendPostInteraction";
import { useUserEngagement } from "@/features/ranking/hooks/useUserEngagement";
import type { EngagementStatus, PostCounts } from "@/features/ranking/types";
import { triggerVoteHaptic } from "@/lib/voteFeedback";
import type { Post } from "../types";
import { usePostInteractionContext } from "../context/PostInteractionContext";
import { usePostShareActions } from "./usePostShareActions";
import { usePostVoteTap } from "./usePostVoteTap";

type UsePostInteractionsOptions = {
  post: Post;
  currentUserId?: string | null;
  engagement?: EngagementStatus;
  onEngagementPatch?: (patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (
    postId: string,
    postScore: number,
    counts?: PostCounts
  ) => void;
};

export function usePostInteractions({
  post,
  currentUserId = null,
  engagement: externalEngagement,
  onEngagementPatch,
  onScoreUpdate,
}: UsePostInteractionsOptions) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const interactionContext = usePostInteractionContext();
  const setAuthorTotalScore = useProfileStore((s) => s.setTotalScore);
  const votesEnabled = Boolean(user?.uid);

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

  const handleFlushedScore = useCallback(
    (result: {
      postScore: number;
      authorTotalScore: number;
      authorId: string;
      counts: PostCounts;
    }) => {
      setCounts(result.counts);
      onScoreUpdate?.(post.id, result.postScore, result.counts);
      patchPublicProfileTotalScore(
        queryClient,
        result.authorId,
        result.authorTotalScore
      );
      if (currentUserId && result.authorId === currentUserId) {
        setAuthorTotalScore(result.authorTotalScore);
      }
    },
    [currentUserId, onScoreUpdate, post.id, queryClient, setAuthorTotalScore]
  );

  const { displayScore, registerUp, registerDown } = usePostVoteTap({
    postId: post.id,
    initialPostScore: post.postScore,
    enabled: votesEnabled,
    onFlushed: handleFlushedScore,
  });

  const applyResult = useCallback(
    (result: NonNullable<Awaited<ReturnType<typeof sendInteraction>>>) => {
      setCounts(result.counts);
      onScoreUpdate?.(post.id, result.postScore, result.counts);

      if (result.engagement) {
        onEngagementPatch?.({
          shared: result.engagement.shared,
          saved: result.engagement.saved,
        });
      }
    },
    [onEngagementPatch, onScoreUpdate, post.id]
  );

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
    if (!votesEnabled) return;
    triggerVoteHaptic();
    registerUp();
  }, [registerUp, votesEnabled]);

  const handleDislike = useCallback(() => {
    if (!votesEnabled) return;
    triggerVoteHaptic();
    registerDown();
  }, [registerDown, votesEnabled]);

  const engagement = useMemo<EngagementStatus>(
    () => ({
      shared: baseEngagement.shared,
      saved: baseEngagement.saved,
      liked: false,
      disliked: false,
    }),
    [baseEngagement.shared, baseEngagement.saved]
  );

  return {
    score: displayScore,
    counts,
    engagement,
    loading: share.commentLoading || share.shareSaveLoading,
    liked: false,
    disliked: false,
    handleLike,
    handleDislike,
    handleExternalShare: share.handleExternalShare,
    handleShare: share.handleShare,
    handleSave: share.handleSave,
    submitComment: share.submitComment,
    applyCommentResult: applyResult,
    shareActive: engagement.shared,
    saveActive: engagement.saved,
  };
}

import { useCallback, useEffect } from "react";
import { useAuth } from "@/features/auth";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import type { EngagementStatus, PostCounts } from "../types";
import { useVoteSessionStore } from "../store/voteSessionStore";

type UseVoteSessionOptions = {
  postId: string;
  authorId: string;
  initialCounts: PostCounts;
  initialPostScore: number;
  initialLikeBonusTotal: number;
  initialDislikeBonusTotal: number;
  initialEngagement: EngagementStatus;
  onEngagementPatch?: (patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
};

export function useVoteSession({
  postId,
  authorId,
  initialCounts,
  initialPostScore,
  initialLikeBonusTotal,
  initialDislikeBonusTotal,
  initialEngagement,
  onEngagementPatch,
  onScoreUpdate,
}: UseVoteSessionOptions) {
  const { user } = useAuth();
  const setAuthorTotalScore = useProfileStore((s) => s.setTotalScore);
  const enabled = Boolean(user?.uid);

  useEffect(() => {
    useVoteSessionStore.getState().ensureSession(postId, {
      authorId,
      initialCounts,
      initialPostScore,
      initialLikeBonusTotal,
      initialDislikeBonusTotal,
      initialEngagement,
      enabled,
      onEngagementPatch,
      onScoreUpdate,
      onAuthorScoreUpdate: (resultAuthorId, totalScore) => {
        if (user?.uid && resultAuthorId === user.uid) {
          setAuthorTotalScore(totalScore);
        }
      },
    });
  // Granular primitive fields avoid resetting the vote session when parent
  // passes new object references with unchanged engagement values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    postId,
    authorId,
    enabled,
    initialCounts.likeCount,
    initialCounts.dislikeCount,
    initialCounts.shareCount,
    initialCounts.saveCount,
    initialCounts.commentCount,
    initialPostScore,
    initialLikeBonusTotal,
    initialDislikeBonusTotal,
    initialEngagement.liked,
    initialEngagement.disliked,
    onEngagementPatch,
    onScoreUpdate,
    setAuthorTotalScore,
    user?.uid,
  ]);

  useEffect(() => {
    return () => {
      const store = useVoteSessionStore.getState();
      void store.flushSession(postId);
      store.removeSession(postId);
    };
  }, [postId]);

  const session = useVoteSessionStore((state) => state.sessions[postId]);
  void useVoteSessionStore((state) => state.versions[postId]);

  const registerLikeTap = useCallback(() => {
    useVoteSessionStore.getState().registerLikeTap(postId);
  }, [postId]);

  const registerDislikeTap = useCallback(() => {
    useVoteSessionStore.getState().registerDislikeTap(postId);
  }, [postId]);

  const applyLikeBonusDelta = useCallback(
    (delta: number) =>
      useVoteSessionStore.getState().applyLikeBonusDelta(postId, delta),
    [postId]
  );

  const applyDislikeBonusDelta = useCallback(
    (delta: number) =>
      useVoteSessionStore.getState().applyDislikeBonusDelta(postId, delta),
    [postId]
  );

  const flushSession = useCallback(async () => {
    await useVoteSessionStore.getState().flushSession(postId);
  }, [postId]);

  const local = session ?? {
    liked: initialEngagement.liked,
    disliked: initialEngagement.disliked,
    counts: initialCounts,
    likeBonusTotal: initialLikeBonusTotal,
    dislikeBonusTotal: initialDislikeBonusTotal,
    postScore: initialPostScore,
  };

  return {
    liked: local.liked,
    disliked: local.disliked,
    counts: local.counts,
    score: local.postScore,
    registerLikeTap,
    registerDislikeTap,
    applyLikeBonusDelta,
    applyDislikeBonusDelta,
    flushSession,
  };
}

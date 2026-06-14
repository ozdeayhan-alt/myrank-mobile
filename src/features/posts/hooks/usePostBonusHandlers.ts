import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import type { BonusPoints } from "@/features/ranking/constants";
import { sendLikeBonus } from "@/features/ranking/api/sendLikeBonus";
import { sendDislikeBonus } from "@/features/ranking/api/sendDislikeBonus";
import type { EngagementStatus } from "@/features/ranking/types";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { useVoteSession } from "@/features/ranking/hooks/useVoteSession";

type VoteSession = ReturnType<typeof useVoteSession>;

type UsePostBonusHandlersOptions = {
  postId: string;
  currentUserId?: string | null;
  voteSession: VoteSession;
  baseEngagement: EngagementStatus;
  onEngagementPatch?: (patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
};

export function usePostBonusHandlers({
  postId,
  currentUserId = null,
  voteSession,
  baseEngagement,
  onEngagementPatch,
  onScoreUpdate,
}: UsePostBonusHandlersOptions) {
  const setAuthorTotalScore = useProfileStore((s) => s.setTotalScore);
  const [actionLoading, setActionLoading] = useState(false);
  const [likeBonusPickerOpen, setLikeBonusPickerOpen] = useState(false);
  const [dislikeBonusPickerOpen, setDislikeBonusPickerOpen] = useState(false);
  const [likeBonusPoints, setLikeBonusPoints] = useState<BonusPoints | null>(
    baseEngagement.likeBonusPoints ?? null
  );
  const [dislikeBonusPoints, setDislikeBonusPoints] = useState<BonusPoints | null>(
    baseEngagement.dislikeBonusPoints ?? null
  );

  useEffect(() => {
    setLikeBonusPoints(baseEngagement.likeBonusPoints ?? null);
    setDislikeBonusPoints(baseEngagement.dislikeBonusPoints ?? null);
  }, [
    postId,
    baseEngagement.likeBonusPoints,
    baseEngagement.dislikeBonusPoints,
  ]);

  const openLikeBonusPicker = useCallback(() => {
    setLikeBonusPickerOpen(true);
  }, []);

  const closeLikeBonusPicker = useCallback(() => {
    if (!actionLoading) {
      setLikeBonusPickerOpen(false);
    }
  }, [actionLoading]);

  const openDislikeBonusPicker = useCallback(() => {
    setDislikeBonusPickerOpen(true);
  }, []);

  const closeDislikeBonusPicker = useCallback(() => {
    if (!actionLoading) {
      setDislikeBonusPickerOpen(false);
    }
  }, [actionLoading]);

  const applyLikeBonus = useCallback(
    async (bonusPoints: BonusPoints) => {
      setActionLoading(true);
      const previousBonus = likeBonusPoints ?? 0;
      const optimisticDelta = bonusPoints - previousBonus;

      const optimisticScore = voteSession.applyLikeBonusDelta(optimisticDelta);
      setLikeBonusPoints(bonusPoints);
      onEngagementPatch?.({ likeBonusPoints: bonusPoints });
      onScoreUpdate?.(postId, optimisticScore);

      try {
        const result = await sendLikeBonus({ postId, bonusPoints });

        if (result.unchanged) {
          setLikeBonusPickerOpen(false);
          return;
        }

        const correctionDelta = result.scoreDelta - optimisticDelta;
        const syncedScore = voteSession.applyLikeBonusDelta(correctionDelta);
        setLikeBonusPoints(result.engagement.likeBonusPoints ?? bonusPoints);
        onScoreUpdate?.(postId, syncedScore);
        onEngagementPatch?.({
          likeBonusPoints: result.engagement.likeBonusPoints ?? bonusPoints,
        });

        if (currentUserId && result.authorId === currentUserId) {
          setAuthorTotalScore(result.authorTotalScore);
        }

        setLikeBonusPickerOpen(false);
      } catch (err) {
        const rollbackScore = voteSession.applyLikeBonusDelta(-optimisticDelta);
        setLikeBonusPoints(
          previousBonus === 0 ? null : (previousBonus as BonusPoints)
        );
        onEngagementPatch?.({
          likeBonusPoints:
            previousBonus === 0 ? null : (previousBonus as BonusPoints),
        });
        onScoreUpdate?.(postId, rollbackScore);
        Alert.alert("Bonus beğeni", getUserFacingErrorMessage(err));
      } finally {
        setActionLoading(false);
      }
    },
    [
      likeBonusPoints,
      onEngagementPatch,
      onScoreUpdate,
      postId,
      setAuthorTotalScore,
      currentUserId,
      voteSession,
    ]
  );

  const applyDislikeBonus = useCallback(
    async (bonusPoints: BonusPoints) => {
      setActionLoading(true);
      const previousBonus = dislikeBonusPoints ?? 0;
      const optimisticDelta = bonusPoints - previousBonus;

      const optimisticScore = voteSession.applyDislikeBonusDelta(optimisticDelta);
      setDislikeBonusPoints(bonusPoints);
      onEngagementPatch?.({ dislikeBonusPoints: bonusPoints });
      onScoreUpdate?.(postId, optimisticScore);

      try {
        const result = await sendDislikeBonus({ postId, bonusPoints });

        if (result.unchanged) {
          setDislikeBonusPickerOpen(false);
          return;
        }

        const correctionDelta = -(result.scoreDelta + optimisticDelta);
        const syncedScore = voteSession.applyDislikeBonusDelta(correctionDelta);
        setDislikeBonusPoints(result.engagement.dislikeBonusPoints ?? bonusPoints);
        onScoreUpdate?.(postId, syncedScore);
        onEngagementPatch?.({
          dislikeBonusPoints: result.engagement.dislikeBonusPoints ?? bonusPoints,
        });

        if (currentUserId && result.authorId === currentUserId) {
          setAuthorTotalScore(result.authorTotalScore);
        }

        setDislikeBonusPickerOpen(false);
      } catch (err) {
        const rollbackScore = voteSession.applyDislikeBonusDelta(-optimisticDelta);
        setDislikeBonusPoints(
          previousBonus === 0 ? null : (previousBonus as BonusPoints)
        );
        onEngagementPatch?.({
          dislikeBonusPoints:
            previousBonus === 0 ? null : (previousBonus as BonusPoints),
        });
        onScoreUpdate?.(postId, rollbackScore);
        Alert.alert("Bonus beğenmeme", getUserFacingErrorMessage(err));
      } finally {
        setActionLoading(false);
      }
    },
    [
      dislikeBonusPoints,
      onEngagementPatch,
      onScoreUpdate,
      postId,
      setAuthorTotalScore,
      currentUserId,
      voteSession,
    ]
  );

  return {
    actionLoading,
    likeBonusPoints,
    dislikeBonusPoints,
    likeBonusPickerOpen,
    dislikeBonusPickerOpen,
    openLikeBonusPicker,
    closeLikeBonusPicker,
    applyLikeBonus,
    openDislikeBonusPicker,
    closeDislikeBonusPicker,
    applyDislikeBonus,
  };
}

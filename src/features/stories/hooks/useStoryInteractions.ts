import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { patchPublicProfileTotalScore } from "@/features/profile/lib/patchPublicProfileTotalScore";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { triggerVoteHaptic } from "@/lib/voteFeedback";
import { recordStoryView } from "../api/recordStoryView";
import type { Story } from "../constants/types";
import { useStoryVoteTap } from "./useStoryVoteTap";

type UseStoryInteractionsOptions = {
  story: Story;
  currentUserId: string | null;
  active: boolean;
  onViewCountChange?: (storyId: string, viewCount: number) => void;
};

export function useStoryInteractions({
  story,
  currentUserId,
  active,
  onViewCountChange,
}: UseStoryInteractionsOptions) {
  const queryClient = useQueryClient();
  const setAuthorTotalScore = useProfileStore((s) => s.setTotalScore);
  const isOwner = Boolean(currentUserId && story.userId === currentUserId);
  const votesEnabled = Boolean(currentUserId);

  const [viewCount, setViewCount] = useState(story.viewCount ?? 0);
  const viewedStoryIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setViewCount(story.viewCount ?? 0);
  }, [story.id, story.viewCount]);

  const { displayScore, registerUp, registerDown } = useStoryVoteTap({
    storyId: story.id,
    initialStoryScore: story.storyScore ?? 0,
    enabled: votesEnabled,
    onFlushed: (result) => {
      patchPublicProfileTotalScore(
        queryClient,
        result.authorId,
        result.authorTotalScore
      );
      if (currentUserId && result.authorId === currentUserId) {
        setAuthorTotalScore(result.authorTotalScore);
      }
    },
  });

  useEffect(() => {
    if (!active || !currentUserId || isOwner) {
      return;
    }
    if (viewedStoryIdsRef.current.has(story.id)) {
      return;
    }
    viewedStoryIdsRef.current.add(story.id);

    void recordStoryView(story.id)
      .then((result) => {
        setViewCount(result.viewCount);
        onViewCountChange?.(story.id, result.viewCount);
      })
      .catch(() => {
        viewedStoryIdsRef.current.delete(story.id);
      });
  }, [active, currentUserId, isOwner, onViewCountChange, story.id]);

  const handleUp = useCallback(() => {
    if (!votesEnabled) {
      return;
    }
    triggerVoteHaptic();
    registerUp();
  }, [registerUp, votesEnabled]);

  const handleDown = useCallback(() => {
    if (!votesEnabled) {
      return;
    }
    triggerVoteHaptic();
    registerDown();
  }, [registerDown, votesEnabled]);

  return {
    isOwner,
    votesEnabled,
    displayScore,
    viewCount,
    handleUp,
    handleDown,
  };
}

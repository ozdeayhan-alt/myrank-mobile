import { useCallback, useState } from "react";
import { useFeedRefreshStore } from "../store/useFeedRefreshStore";
import type { Post } from "../types";
import { canRepostPost } from "../utils/repostUtils";
import { usePostInteractions } from "./usePostInteractions";
import type { EngagementStatus } from "@/features/ranking/types";

type UseShareAndRepostOptions = {
  post: Post;
  currentUserId?: string | null;
  engagement?: EngagementStatus;
  onEngagementPatch?: (patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
};

export function useShareAndRepost({
  post,
  currentUserId = null,
  engagement,
  onEngagementPatch,
  onScoreUpdate,
}: UseShareAndRepostOptions) {
  const bumpFeed = useFeedRefreshStore((s) => s.bump);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);

  const interactions = usePostInteractions({
    post,
    currentUserId,
    engagement,
    onEngagementPatch,
    onScoreUpdate,
  });

  const canRepost = canRepostPost(post, currentUserId ?? undefined);

  const handleSharePress = useCallback(() => {
    setShareSheetOpen(true);
  }, []);

  const handleRepostSelect = useCallback(() => {
    setShareSheetOpen(false);
    setRepostOpen(true);
  }, []);

  const handleExternalShareSelect = useCallback(() => {
    setShareSheetOpen(false);
    void interactions.handleExternalShare();
  }, [interactions.handleExternalShare]);

  const handleReposted = useCallback(() => {
    bumpFeed();
  }, [bumpFeed]);

  return {
    ...interactions,
    handleSharePress,
    shareSheetOpen,
    setShareSheetOpen,
    repostOpen,
    setRepostOpen,
    handleReposted,
    canRepost,
    handleRepostSelect,
    handleExternalShareSelect,
  };
}

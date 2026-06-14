import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFeedRefreshStore } from "../store/useFeedRefreshStore";
import type { Post } from "../types";
import { canRepostPost } from "../utils/repostUtils";
import { openShareOptions } from "../utils/openShareOptions";
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
    openShareOptions({
      canRepost,
      onRepost: () => setRepostOpen(true),
      onExternalShare: interactions.handleExternalShare,
    });
  }, [canRepost, interactions.handleExternalShare]);

  const handleReposted = useCallback(() => {
    bumpFeed();
    Alert.alert("Başarılı", "Gönderi akışınıza paylaşıldı.");
  }, [bumpFeed]);

  return {
    ...interactions,
    handleSharePress,
    repostOpen,
    setRepostOpen,
    handleReposted,
    canRepost,
  };
}

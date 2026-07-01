import type { VoteBurstDirection } from "@/components/LikeHeartBurst";
import { memo, useCallback, useState } from "react";
import { usePostEngagement } from "@/features/ranking/store/useEngagementStore";
import type { EngagementStatus } from "@/features/ranking/types";
import { useIsFeedPostMediaHighPriority } from "../context/FeedVisiblePostsContext";
import { useOpenCommentSheet } from "../hooks/useOpenCommentSheet";
import { usePostInteractions } from "../hooks/usePostInteractions";
import { useFeedInteractionStore } from "../store/useFeedInteractionStore";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";
import type { Post } from "../types";
import { FeedStreamCell } from "./FeedStreamCell";

type FeedStreamRowProps = PostFeedMediaLayoutOptions & {
  post: Post;
  patchEngagement: (
    postId: string,
    patch: Partial<EngagementStatus>
  ) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onOpenVideo?: (postId: string) => void;
  currentUserId?: string | null;
};

export const FeedStreamRow = memo(function FeedStreamRow({
  post,
  patchEngagement,
  onScoreUpdate,
  onOpenVideo,
  currentUserId = null,
  listHorizontalInset,
  mediaEdgeBleed,
}: FeedStreamRowProps) {
  const engagement = usePostEngagement(post.id);
  const openCommentSheet = useOpenCommentSheet();
  const mediaHighPriority = useIsFeedPostMediaHighPriority(post.id);
  const openShare = useFeedInteractionStore((s) => s.openShare);
  const openOwnerMenu = useFeedInteractionStore((s) => s.openOwnerMenu);
  const openMoreMenu = useFeedInteractionStore((s) => s.openMoreMenu);

  const [voteBurstKey, setVoteBurstKey] = useState(0);
  const [voteBurstDirection, setVoteBurstDirection] =
    useState<VoteBurstDirection>("up");

  const handlePatch = useCallback(
    (patch: Partial<EngagementStatus>) => {
      patchEngagement(post.id, patch);
    },
    [post.id, patchEngagement]
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

  const isOwner = Boolean(currentUserId && post.authorId === currentUserId);

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

  return (
    <FeedStreamCell
      post={post}
      score={score}
      counts={counts}
      shareActive={shareActive}
      saveActive={saveActive}
      loading={loading}
      isOwner={isOwner}
      currentUserId={currentUserId}
      voteBurstKey={voteBurstKey}
      voteBurstDirection={voteBurstDirection}
      onLike={handleLikePress}
      onLikeAnimated={() => triggerVoteBurst("up")}
      onDislike={handleDislikePress}
      onComment={() => openCommentSheet(post.id, applyCommentResult)}
      onShare={() => openShare(post)}
      onSave={handleSave}
      onOwnerMenu={() => openOwnerMenu(post)}
      onMoreMenu={() => openMoreMenu(post)}
      onOpenVideo={onOpenVideo}
      imagePriority={mediaHighPriority ? "high" : "normal"}
      listHorizontalInset={listHorizontalInset}
      mediaEdgeBleed={mediaEdgeBleed}
    />
  );
});

import type { VoteBurstDirection } from "@/components/LikeHeartBurst";
import { memo, useCallback, useRef } from "react";
import { usePostEngagement } from "@/features/ranking/store/useEngagementStore";
import type { EngagementStatus } from "@/features/ranking/types";
import { useIsFeedPostMediaHighPriority } from "../context/FeedVisiblePostsContext";
import { useOpenCommentSheet } from "../hooks/useOpenCommentSheet";
import { usePostInteractions } from "../hooks/usePostInteractions";
import { useFeedInteractionStore } from "../store/useFeedInteractionStore";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";
import type { Post } from "../types";
import { FeedStreamCell } from "./FeedStreamCell";
import { type PostVoteBurstHandle } from "./PostVoteBurstLayer";

type FeedStreamRowProps = PostFeedMediaLayoutOptions & {
  post: Post;
  patchEngagement: (
    postId: string,
    patch: Partial<EngagementStatus>
  ) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  currentUserId?: string | null;
};

export const FeedStreamRow = memo(function FeedStreamRow({
  post,
  patchEngagement,
  onScoreUpdate,
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
  const burstRef = useRef<PostVoteBurstHandle>(null);

  const handlePatch = useCallback(
    (patch: Partial<EngagementStatus>) => {
      patchEngagement(post.id, patch);
    },
    [post.id, patchEngagement]
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

  const isOwner = Boolean(currentUserId && post.authorId === currentUserId);

  const triggerVoteBurst = useCallback((direction: VoteBurstDirection) => {
    burstRef.current?.trigger(direction);
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
      burstRef={burstRef}
      counts={counts}
      shareActive={shareActive}
      saveActive={saveActive}
      loading={loading}
      isOwner={isOwner}
      currentUserId={currentUserId}
      onLike={handleLike}
      onLikeAnimated={() => triggerVoteBurst("up")}
      onLikePress={handleLikePress}
      onDislikePress={handleDislikePress}
      onDislike={handleDislike}
      onComment={() => openCommentSheet(post.id, applyCommentResult)}
      onShare={() => openShare(post)}
      onSave={handleSave}
      onOwnerMenu={() => openOwnerMenu(post)}
      onMoreMenu={() => openMoreMenu(post)}
      imagePriority={mediaHighPriority ? "high" : "normal"}
      listHorizontalInset={listHorizontalInset}
      mediaEdgeBleed={mediaEdgeBleed}
    />
  );
});

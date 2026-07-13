import { memo } from "react";
import { usePostEngagement } from "@/features/ranking/store/useEngagementStore";
import type { EngagementStatus } from "@/features/ranking/types";
import { useIsFeedPostMediaHighPriority } from "../context/FeedVisiblePostsContext";
import { useOpenCommentSheet } from "../hooks/useOpenCommentSheet";
import { usePostInteractions } from "../hooks/usePostInteractions";
import { usePostVoteFeedback } from "../hooks/usePostVoteFeedback";
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
  const { fountainRef, triggerFeedback, buttonPulseSeq, lastButtonPulse } =
    usePostVoteFeedback();

  const handlePatch = (patch: Partial<EngagementStatus>) => {
    patchEngagement(post.id, patch);
  };

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

  return (
    <FeedStreamCell
      post={post}
      fountainRef={fountainRef}
      buttonPulseSeq={buttonPulseSeq}
      lastButtonPulse={lastButtonPulse}
      counts={counts}
      shareActive={shareActive}
      saveActive={saveActive}
      loading={loading}
      isOwner={isOwner}
      currentUserId={currentUserId}
      onLike={handleLike}
      onLikeAnimated={() => triggerFeedback("up")}
      onLikePress={() => {
        handleLike();
        triggerFeedback("up");
      }}
      onDislikePress={() => {
        handleDislike();
        triggerFeedback("down");
      }}
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

import { memo, useCallback } from "react";
import { usePostEngagement } from "@/features/ranking/store/useEngagementStore";
import type { EngagementStatus } from "@/features/ranking/types";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";
import type { Post } from "../types";
import { FeedPostCell } from "./FeedPostCell";

type FeedPostRowProps = PostFeedMediaLayoutOptions & {
  post: Post;
  patchEngagement: (
    postId: string,
    patch: Partial<EngagementStatus>
  ) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  currentUserId?: string | null;
};

export const FeedPostRow = memo(function FeedPostRow({
  post,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
  currentUserId = null,
  listHorizontalInset,
  mediaEdgeBleed,
}: FeedPostRowProps) {
  const engagement = usePostEngagement(post.id);

  const handlePatch = useCallback(
    (patch: Partial<EngagementStatus>) => {
      patchEngagement(post.id, patch);
    },
    [post.id, patchEngagement]
  );

  return (
    <FeedPostCell
      post={post}
      engagement={engagement}
      patchEngagement={handlePatch}
      onScoreUpdate={onScoreUpdate}
      onPostDeleted={onPostDeleted}
      onPostContentUpdated={onPostContentUpdated}
      currentUserId={currentUserId}
      listHorizontalInset={listHorizontalInset}
      mediaEdgeBleed={mediaEdgeBleed}
    />
  );
});

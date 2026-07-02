import { memo } from "react";
import type { EngagementStatus } from "@/features/ranking/types";
import type { Post } from "@/features/posts/types";
import { FeedPostErrorBoundary } from "@/features/posts/components/FeedPostErrorBoundary";
import { FeedRowChrome } from "../shared/FeedRowChrome";
import { useFeedRowInteractions } from "../shared/useFeedRowInteractions";

type WhispRowProps = {
  post: Post;
  patchEngagement: (postId: string, patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  currentUserId?: string | null;
};

function WhispRowInner({
  post,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
  currentUserId = null,
}: WhispRowProps) {
  const row = useFeedRowInteractions({
    post,
    currentUserId,
    patchEngagement: (patch) => patchEngagement(post.id, patch),
    onScoreUpdate,
    onPostDeleted,
    onPostContentUpdated,
  });

  return (
    <FeedRowChrome row={row} currentUserId={currentUserId} />
  );
}

export const WhispRow = memo(function WhispRow(props: WhispRowProps) {
  return (
    <FeedPostErrorBoundary post={props.post}>
      <WhispRowInner {...props} />
    </FeedPostErrorBoundary>
  );
});

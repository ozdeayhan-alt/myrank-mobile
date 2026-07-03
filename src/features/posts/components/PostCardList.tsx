import { useIncrementalEngagement } from "@/features/ranking/hooks/useIncrementalEngagement";
import { PostInteractionProvider } from "../context/PostInteractionContext";
import type { Post } from "../types";
import { FeedPostRow } from "./FeedPostRow";

type PostCardListProps = {
  posts: Post[];
  onScoreUpdate?: (postId: string, postScore: number) => void;
  keyPrefix?: string;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  currentUserId?: string | null;
};

export function PostCardList({
  posts,
  onScoreUpdate,
  keyPrefix = "",
  onPostDeleted,
  onPostContentUpdated,
  currentUserId = null,
}: PostCardListProps) {
  const postIds = posts.map((post) => post.id);
  const engagementResetKey = keyPrefix || "post-card-list";
  const { patchEngagement } = useIncrementalEngagement(
    postIds,
    engagementResetKey
  );

  return (
    <PostInteractionProvider currentUserId={currentUserId}>
      {posts.map((post) => (
        <FeedPostRow
          key={`${keyPrefix}${post.id}`}
          post={post}
          patchEngagement={patchEngagement}
          onScoreUpdate={onScoreUpdate}
          onPostDeleted={onPostDeleted}
          onPostContentUpdated={onPostContentUpdated}
        />
      ))}
    </PostInteractionProvider>
  );
}

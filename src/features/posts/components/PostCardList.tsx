import { useCallback, useMemo } from "react";
import { useIncrementalEngagement } from "@/features/ranking/hooks/useIncrementalEngagement";
import { PostInteractionProvider } from "../context/PostInteractionContext";
import type { Post } from "../types";
import { navigateToReels } from "../navigateToReels";
import { filterVideoPosts } from "../utils/videoPosts";
import { FeedPostRow } from "./FeedPostRow";

type PostCardListProps = {
  posts: Post[];
  /** Tam ekran kaydırma listesi; verilmezse yalnızca `posts` içindeki videolar */
  videoPosts?: Post[];
  onScoreUpdate?: (postId: string, postScore: number) => void;
  keyPrefix?: string;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  currentUserId?: string | null;
};

export function PostCardList({
  posts,
  videoPosts: videoPostsProp,
  onScoreUpdate,
  keyPrefix = "",
  onPostDeleted,
  onPostContentUpdated,
  currentUserId = null,
}: PostCardListProps) {
  const postIds = useMemo(() => posts.map((post) => post.id), [posts]);
  const engagementResetKey = keyPrefix || "post-card-list";
  const { patchEngagement } = useIncrementalEngagement(
    postIds,
    engagementResetKey
  );

  const playlist = useMemo(
    () => videoPostsProp ?? filterVideoPosts(posts),
    [videoPostsProp, posts]
  );

  const handleOpenVideo = useCallback(
    (postId: string) => {
      navigateToReels(postId, playlist);
    },
    [playlist]
  );

  return (
    <PostInteractionProvider currentUserId={currentUserId}>
      {posts.map((post) => (
        <FeedPostRow
          key={`${keyPrefix}${post.id}`}
          post={post}
          patchEngagement={patchEngagement}
          onScoreUpdate={onScoreUpdate}
          onOpenVideo={handleOpenVideo}
          onPostDeleted={onPostDeleted}
          onPostContentUpdated={onPostContentUpdated}
        />
      ))}

    </PostInteractionProvider>
  );
}

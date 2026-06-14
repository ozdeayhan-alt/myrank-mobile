import { useCallback, useMemo, useState } from "react";
import { useIncrementalEngagement } from "@/features/ranking/hooks/useIncrementalEngagement";
import type { EngagementStatus } from "@/features/ranking/types";
import { PostInteractionProvider } from "../context/PostInteractionContext";
import type { Post } from "../types";
import { filterVideoPosts } from "../utils/videoPosts";
import { FeedPostRow } from "./FeedPostRow";
import { VideoReelsViewer } from "./VideoReelsViewer";

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
  const engagementResetKey = useMemo(
    () => `${keyPrefix}${postIds.join(",")}`,
    [keyPrefix, postIds]
  );
  const { getEngagement, patchEngagement } = useIncrementalEngagement(
    postIds,
    engagementResetKey
  );

  const playlist = useMemo(
    () => videoPostsProp ?? filterVideoPosts(posts),
    [videoPostsProp, posts]
  );

  const [openVideoId, setOpenVideoId] = useState<string | null>(null);

  const handlePatch = useCallback(
    (postId: string, patch: Partial<EngagementStatus>) => {
      patchEngagement(postId, patch);
    },
    [patchEngagement]
  );

  return (
    <PostInteractionProvider currentUserId={currentUserId}>
      {posts.map((post) => (
        <FeedPostRow
          key={`${keyPrefix}${post.id}`}
          post={post}
          patchEngagement={patchEngagement}
          onScoreUpdate={onScoreUpdate}
          onOpenVideo={setOpenVideoId}
          onPostDeleted={onPostDeleted}
          onPostContentUpdated={onPostContentUpdated}
        />
      ))}

      {openVideoId && playlist.length > 0 ? (
        <VideoReelsViewer
          visible
          videoPosts={playlist}
          initialPostId={openVideoId}
          onClose={() => setOpenVideoId(null)}
          onScoreUpdate={onScoreUpdate}
          getEngagement={getEngagement}
          patchEngagement={handlePatch}
        />
      ) : null}
    </PostInteractionProvider>
  );
}

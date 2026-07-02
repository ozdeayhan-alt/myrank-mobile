import { memo } from "react";
import { View, useWindowDimensions } from "react-native";
import type { EngagementStatus } from "@/features/ranking/types";
import type { Post } from "@/features/posts/types";
import { FeedPostErrorBoundary } from "@/features/posts/components/FeedPostErrorBoundary";
import { RichPostText } from "@/features/posts/components/RichPostText";
import { estimateFeedStreamRowHeight } from "@/features/posts/utils/feedStreamLayout";
import { postBodyText } from "@/features/posts/utils/postBodyText";
import { useIsFeedPostMediaHighPriority } from "@/features/posts/context/FeedVisiblePostsContext";
import { DEFAULT_LIST_HORIZONTAL_INSET } from "@/features/posts/constants/feedMediaLayout";
import { FeedRowChrome } from "../shared/FeedRowChrome";
import { useFeedRowInteractions } from "../shared/useFeedRowInteractions";
import { GlowImageFrame } from "./GlowImageFrame";

type GlowRowProps = {
  post: Post;
  patchEngagement: (postId: string, patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  currentUserId?: string | null;
};

function GlowRowInner({
  post,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
  currentUserId = null,
}: GlowRowProps) {
  const mediaHighPriority = useIsFeedPostMediaHighPriority(post.id);
  const bodyText = postBodyText(post);

  const row = useFeedRowInteractions({
    post,
    currentUserId,
    patchEngagement: (patch) => patchEngagement(post.id, patch),
    onScoreUpdate,
    onPostDeleted,
    onPostContentUpdated,
  });

  return (
    <FeedRowChrome
      row={row}
      currentUserId={currentUserId}
      bodyBelow={
        bodyText ? (
          <View className="px-4 py-3">
            <RichPostText content={bodyText} currentUserId={currentUserId} />
          </View>
        ) : null
      }
    >
      <GlowImageFrame
        post={post}
        imagePriority={mediaHighPriority ? "high" : "normal"}
      />
    </FeedRowChrome>
  );
}

export const GlowRow = memo(function GlowRow(props: GlowRowProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = Math.max(
    0,
    screenWidth - DEFAULT_LIST_HORIZONTAL_INSET * 2
  );
  const estimatedHeight = estimateFeedStreamRowHeight(
    props.post,
    containerWidth
  );

  return (
    <FeedPostErrorBoundary post={props.post}>
      <View style={{ minHeight: estimatedHeight }}>
        <GlowRowInner {...props} />
      </View>
    </FeedPostErrorBoundary>
  );
});

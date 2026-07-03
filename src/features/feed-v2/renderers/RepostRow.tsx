import { memo } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import type { EngagementStatus } from "@/features/ranking/types";
import type { Post } from "@/features/posts/types";
import { FeedPostErrorBoundary } from "@/features/posts/components/FeedPostErrorBoundary";
import { RichPostText } from "@/features/posts/components/RichPostText";
import { DEFAULT_LIST_HORIZONTAL_INSET } from "@/features/posts/constants/feedMediaLayout";
import {
  isRepostPost,
  resolveEmbeddedOriginalPost,
} from "@/features/posts/utils/repostUtils";
import { resolvePostAuthorDisplayName } from "@/features/posts/utils/resolvePostAuthor";
import { estimateFeedStreamRowHeight } from "@/features/posts/utils/feedStreamLayout";
import { postBodyText } from "@/features/posts/utils/postBodyText";
import { resolveFeedListItemKind } from "@/features/feed-v2/engine/filtering";
import { FeedRowChrome } from "./shared/FeedRowChrome";
import { useFeedRowInteractions } from "./shared/useFeedRowInteractions";
import { GlowImageFrame } from "./glow/GlowImageFrame";

type RepostRowProps = {
  post: Post;
  patchEngagement: (postId: string, patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  currentUserId?: string | null;
};

function EmbeddedRepostContent({
  post,
  currentUserId,
}: {
  post: Post;
  currentUserId?: string | null;
}) {
  const embedded = resolveEmbeddedOriginalPost(post);
  if (!embedded) {
    return null;
  }

  const kind = resolveFeedListItemKind(embedded);

  if (kind === "whisp") {
    const text = postBodyText(embedded);
    if (!text) {
      return null;
    }
    return (
      <View className="px-4 pb-3">
        <RichPostText content={text} currentUserId={currentUserId} />
      </View>
    );
  }

  if (kind === "glow") {
    return <GlowImageFrame post={embedded} />;
  }

  return null;
}

function RepostRowInner({
  post,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
  currentUserId = null,
}: RepostRowProps) {
  const embedded = resolveEmbeddedOriginalPost(post);
  const repostAttribution =
    isRepostPost(post) && embedded
      ? `${resolvePostAuthorDisplayName(post)}, ${resolvePostAuthorDisplayName(embedded)} adlı kullanıcının gönderisini paylaştı`
      : null;
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
    <FeedRowChrome row={row} currentUserId={currentUserId}>
      <>
        {repostAttribution ? (
          <View className="px-4 pb-2 pt-1">
            <Text className="text-xs text-gray-500" numberOfLines={2}>
              {repostAttribution}
            </Text>
          </View>
        ) : null}
        {bodyText ? (
          <View className="px-4 pb-3">
            <RichPostText content={bodyText} currentUserId={currentUserId} />
          </View>
        ) : null}
        <EmbeddedRepostContent post={post} currentUserId={currentUserId} />
      </>
    </FeedRowChrome>
  );
}

export const RepostRow = memo(function RepostRow(props: RepostRowProps) {
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
        <RepostRowInner {...props} />
      </View>
    </FeedPostErrorBoundary>
  );
});

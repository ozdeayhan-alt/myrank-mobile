import { memo, useMemo } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import type { EngagementStatus } from "@/features/ranking/types";
import type { Post } from "@/features/posts/types";
import { FeedPostErrorBoundary } from "@/features/posts/components/FeedPostErrorBoundary";
import { RichPostText } from "@/features/posts/components/RichPostText";
import { resolveFeedSlotMediaLayout } from "@/features/feed/resolveFeedSlotLayout";
import { DEFAULT_LIST_HORIZONTAL_INSET } from "@/features/posts/constants/feedMediaLayout";
import {
  isRepostPost,
  resolveEmbeddedOriginalPost,
} from "@/features/posts/utils/repostUtils";
import { resolvePostAuthorDisplayName } from "@/features/posts/utils/resolvePostAuthor";
import { estimateFeedStreamRowHeight } from "@/features/posts/utils/feedStreamLayout";
import { postBodyText } from "@/features/posts/utils/postBodyText";
import { isVideoPost } from "@/features/posts/utils/videoPosts";
import { resolveFeedListItemKind } from "@/features/feed-v2/engine/filtering";
import { listVideoPosterCandidateUrls } from "@/lib/media/resolveMediaDisplayUrl";
import { FeedRowChrome } from "./shared/FeedRowChrome";
import { useFeedRowInteractions } from "./shared/useFeedRowInteractions";
import { GlowImageFrame } from "./glow/GlowImageFrame";

type RepostRowProps = {
  post: Post;
  patchEngagement: (postId: string, patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  onOpenFlow: (postId: string) => void;
  currentUserId?: string | null;
};

function EmbeddedFlowPoster({
  post,
  onOpenFlow,
}: {
  post: Post;
  onOpenFlow: (postId: string) => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = Math.max(
    0,
    screenWidth - DEFAULT_LIST_HORIZONTAL_INSET * 2
  );
  const layout = useMemo(
    () => resolveFeedSlotMediaLayout(post, containerWidth),
    [post, containerWidth]
  );
  const posterUri = listVideoPosterCandidateUrls(post)[0];

  if (!isVideoPost(post) || !posterUri) {
    return null;
  }

  return (
    <Pressable
      onPress={() => onOpenFlow(post.id)}
      accessibilityRole="button"
      accessibilityLabel="Videoyu aç"
      style={{ width: "100%", alignItems: "center" }}
    >
      <View
        style={{ width: layout.width, height: layout.height }}
        className="overflow-hidden bg-neutral-300"
      >
        <Image
          source={{ uri: posterUri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={`${post.id}-embedded-poster`}
        />
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center"
        >
          <View className="rounded-full bg-black/50 px-5 py-3">
            <Text className="text-2xl text-white">▶</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function EmbeddedRepostContent({
  post,
  onOpenFlow,
  currentUserId,
}: {
  post: Post;
  onOpenFlow: (postId: string) => void;
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

  if (kind === "flow-teaser") {
    return <EmbeddedFlowPoster post={embedded} onOpenFlow={onOpenFlow} />;
  }

  return null;
}

function RepostRowInner({
  post,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
  onOpenFlow,
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
        <EmbeddedRepostContent
          post={post}
          onOpenFlow={onOpenFlow}
          currentUserId={currentUserId}
        />
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

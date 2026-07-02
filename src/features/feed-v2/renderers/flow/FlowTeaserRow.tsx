import { memo, useMemo } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import type { EngagementStatus } from "@/features/ranking/types";
import type { Post } from "@/features/posts/types";
import { FeedPostErrorBoundary } from "@/features/posts/components/FeedPostErrorBoundary";
import { RichPostText } from "@/features/posts/components/RichPostText";
import { estimateFeedStreamRowHeight } from "@/features/posts/utils/feedStreamLayout";
import { postBodyText } from "@/features/posts/utils/postBodyText";
import { useIsFeedPostMediaHighPriority } from "@/features/posts/context/FeedVisiblePostsContext";
import { resolveFeedSlotMediaLayout } from "@/features/feed/resolveFeedSlotLayout";
import {
  listVideoPosterCandidateUrls,
} from "@/lib/media/resolveMediaDisplayUrl";
import { DEFAULT_LIST_HORIZONTAL_INSET } from "@/features/posts/constants/feedMediaLayout";
import { FeedRowChrome } from "../shared/FeedRowChrome";
import { useFeedRowInteractions } from "../shared/useFeedRowInteractions";

function PlayOverlay() {
  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 items-center justify-center"
    >
      <View className="rounded-full bg-black/50 px-5 py-3">
        <Text className="text-2xl text-white">▶</Text>
      </View>
    </View>
  );
}

type FlowTeaserRowProps = {
  post: Post;
  patchEngagement: (postId: string, patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  onPostDeleted?: (postId: string) => void;
  onPostContentUpdated?: (postId: string, content: string) => void;
  onOpenFlow: (postId: string) => void;
  currentUserId?: string | null;
};

function FlowTeaserPoster({
  post,
  imagePriority,
}: {
  post: Post;
  imagePriority: "low" | "normal" | "high";
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
  const candidates = useMemo(
    () => listVideoPosterCandidateUrls(post),
    [post.id, post.posterURL, post.mediaURL]
  );
  const posterUri = candidates[0];

  if (!posterUri) {
    return (
      <View
        style={{ width: layout.width, height: layout.height }}
        className="self-center bg-neutral-900"
      />
    );
  }

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <View
        style={{ width: layout.width, height: layout.height }}
        className="overflow-hidden bg-neutral-300"
      >
        <Image
          source={{ uri: posterUri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={`${post.id}-flow-poster`}
          priority={imagePriority}
        />
        <PlayOverlay />
      </View>
    </View>
  );
}

function FlowTeaserRowInner({
  post,
  patchEngagement,
  onScoreUpdate,
  onPostDeleted,
  onPostContentUpdated,
  onOpenFlow,
  currentUserId = null,
}: FlowTeaserRowProps) {
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

  const openFlow = () => onOpenFlow(post.id);

  return (
    <FeedRowChrome
      row={row}
      currentUserId={currentUserId}
      onSinglePress={openFlow}
      accessibilityLabel="Tek dokunuşla videoyu aç, çift dokunarak beğen"
      bodyBelow={
        bodyText ? (
          <View className="px-4 py-3">
            <RichPostText content={bodyText} currentUserId={currentUserId} />
          </View>
        ) : null
      }
    >
      <Pressable onPress={openFlow} accessibilityRole="button" accessibilityLabel="Videoyu aç">
        <FlowTeaserPoster
          post={post}
          imagePriority={mediaHighPriority ? "high" : "normal"}
        />
      </Pressable>
    </FeedRowChrome>
  );
}

export const FlowTeaserRow = memo(function FlowTeaserRow(props: FlowTeaserRowProps) {
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
        <FlowTeaserRowInner {...props} />
      </View>
    </FeedPostErrorBoundary>
  );
});

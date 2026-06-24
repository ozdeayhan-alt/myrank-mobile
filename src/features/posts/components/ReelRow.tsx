import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { VideoView } from "expo-video";
import { resolveVideoPosterUrl } from "@/lib/media/resolveMediaDisplayUrl";
import type { Post } from "../types";
import { useReelRowPlayback } from "../hooks/useReelRowPlayback";
import { useReelRowMode, type ReelRowMode } from "../store/useReelsActiveIndexStore";
import { VideoReelOverlay } from "./VideoReelOverlay";

export type { ReelRowMode };

type ReelRowProps = {
  post: Post;
  index: number;
  enabled: boolean;
  width: number;
  height: number;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  overlayBottomInset?: number;
};

function reelRowPropsAreEqual(prev: ReelRowProps, next: ReelRowProps): boolean {
  return (
    prev.index === next.index &&
    prev.enabled === next.enabled &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.overlayBottomInset === next.overlayBottomInset &&
    prev.post.id === next.post.id &&
    prev.post.mediaURL === next.post.mediaURL &&
    prev.post.hlsURL === next.post.hlsURL
  );
}

function ReelRowInner({
  post,
  index,
  enabled,
  width,
  height,
  onScoreUpdate,
  overlayBottomInset,
}: ReelRowProps) {
  const mode = useReelRowMode(index);
  const { player, showPoster, shouldRenderVideo } = useReelRowPlayback({
    post,
    mode,
    enabled,
  });

  const posterUri = showPoster ? resolveVideoPosterUrl(post) : undefined;

  return (
    <View style={{ width, height, backgroundColor: "#000" }}>
      {posterUri ? (
        <Image
          source={{ uri: posterUri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={post.id}
          priority="high"
        />
      ) : null}

      {shouldRenderVideo ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={false}
        />
      ) : null}

      {mode === "active" ? (
        <VideoReelOverlay
          post={post}
          onScoreUpdate={onScoreUpdate}
          bottomInset={overlayBottomInset}
        />
      ) : null}
    </View>
  );
}

export const ReelRow = memo(ReelRowInner, reelRowPropsAreEqual);

import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { VideoView } from "expo-video";
import { resolveVideoPosterUrl } from "@/lib/media/resolveMediaDisplayUrl";
import { VideoReelOverlay } from "@/features/posts/components/VideoReelOverlay";
import type { Post } from "@/features/posts/types";
import { postHasReelVideo } from "@/features/posts/utils/resolveReelVideoSource";
import { usePlayerPool } from "./player/PlayerPool";

type FlowRowSurfaceProps = {
  post: Post;
  index: number;
  width: number;
  height: number;
  onScoreUpdate?: (postId: string, postScore: number) => void;
  overlayBottomInset?: number;
};

function FlowRowSurfaceInner({
  post,
  index,
  width,
  height,
  onScoreUpdate,
  overlayBottomInset,
}: FlowRowSurfaceProps) {
  const pool = usePlayerPool();
  const assignment = pool.getAssignment(index);
  const showPoster = pool.showPoster(index);
  const loadFailed = pool.loadFailed(index);
  const shouldRenderVideo = pool.shouldRenderVideo(index);
  const isActive = assignment?.mode === "active";

  const posterUri =
    showPoster || (assignment?.mode === "adjacent" && postHasReelVideo(post))
      ? resolveVideoPosterUrl(post)
      : undefined;

  const slotId = assignment?.slotId ?? null;
  const player = slotId ? pool.getPlayer(slotId) : null;
  const playerGeneration = slotId ? pool.getPlayerGeneration(slotId) : 0;

  return (
    <View style={{ width, height, backgroundColor: "#000", overflow: "hidden" }}>
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

      {shouldRenderVideo && player ? (
        <VideoView
          key={`${slotId}-${playerGeneration}`}
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={false}
        />
      ) : null}

      {loadFailed ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 items-center justify-center bg-black/70 px-6"
        >
          <Text className="text-center text-sm font-medium text-white">
            Video yüklenemedi
          </Text>
        </View>
      ) : null}

      {isActive ? (
        <VideoReelOverlay
          post={post}
          onScoreUpdate={onScoreUpdate}
          bottomInset={overlayBottomInset}
          layoutWidth={width}
          layoutHeight={height}
        />
      ) : null}
    </View>
  );
}

export const FlowRowSurface = memo(FlowRowSurfaceInner);

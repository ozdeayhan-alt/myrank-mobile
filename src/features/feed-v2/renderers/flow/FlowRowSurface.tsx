import { memo, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { VideoView } from "expo-video";
import { resolveVideoPosterUrl } from "@/lib/media/resolveMediaDisplayUrl";
import { VideoReelOverlay } from "@/features/posts/components/VideoReelOverlay";
import type { Post } from "@/features/posts/types";
import { postHasReelVideo } from "@/features/posts/utils/resolveReelVideoSource";
import { useReelsActiveIndexStore } from "@/features/posts/store/useReelsActiveIndexStore";
import { devFlowLog, safePlayerStatus } from "@/lib/devLog";
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
  const activeIndex = useReelsActiveIndexStore((s) => s.activeIndex);
  const assignment = pool.getAssignment(index);
  const loadFailed = pool.loadFailed(index);
  const shouldRenderVideo = pool.shouldRenderVideo(index);
  const isActive = assignment?.mode === "active";
  const hasVideo = postHasReelVideo(post);

  const slotId = assignment?.slotId ?? null;
  const player = slotId ? pool.getPlayer(slotId) : null;
  const playerGeneration = slotId ? pool.getPlayerGeneration(slotId) : 0;

  const [firstFrameRendered, setFirstFrameRendered] = useState(false);
  const prevShouldRenderVideoRef = useRef(shouldRenderVideo);
  const prevPosterVisibleRef = useRef(false);

  useEffect(() => {
    setFirstFrameRendered(false);
  }, [post.id, playerGeneration]);

  const handleFirstFrameRender = useCallback(() => {
    setFirstFrameRendered(true);
    devFlowLog("FlowRowSurface", "firstFrameRendered", {
      postId: post.id,
      slot: slotId,
      generation: playerGeneration,
      activeIndex,
      mode: assignment?.mode ?? null,
      status: "true",
    });
  }, [activeIndex, assignment?.mode, playerGeneration, post.id, slotId]);

  const posterUrl = hasVideo ? resolveVideoPosterUrl(post) : undefined;
  const showAdjacentPoster =
    assignment?.mode === "adjacent" && Boolean(posterUrl);
  // readyToPlay ≠ first frame painted; keep poster until VideoView reports a frame.
  const showActivePosterCover =
    isActive && Boolean(posterUrl) && (!player || !firstFrameRendered);
  const posterUri =
    showActivePosterCover || showAdjacentPoster ? posterUrl : undefined;
  const posterVisible = Boolean(posterUri);
  const showVideo = shouldRenderVideo && Boolean(player);

  useEffect(() => {
    if (prevShouldRenderVideoRef.current === shouldRenderVideo) {
      return;
    }
    devFlowLog("FlowRowSurface", "shouldRenderVideo", {
      postId: post.id,
      slot: slotId,
      generation: playerGeneration,
      activeIndex,
      mode: assignment?.mode ?? null,
      status: `${prevShouldRenderVideoRef.current}->${shouldRenderVideo}`,
    });
    prevShouldRenderVideoRef.current = shouldRenderVideo;
  }, [
    activeIndex,
    assignment?.mode,
    playerGeneration,
    post.id,
    shouldRenderVideo,
    slotId,
  ]);

  useEffect(() => {
    if (prevPosterVisibleRef.current === posterVisible) {
      return;
    }
    devFlowLog("FlowRowSurface", "poster visible", {
      postId: post.id,
      slot: slotId,
      generation: playerGeneration,
      activeIndex,
      mode: assignment?.mode ?? null,
      status: posterVisible ? "visible" : "hidden",
    });
    prevPosterVisibleRef.current = posterVisible;
  }, [
    activeIndex,
    assignment?.mode,
    playerGeneration,
    posterVisible,
    post.id,
    slotId,
  ]);

  useEffect(() => {
    if (!showVideo) {
      return;
    }
    devFlowLog("FlowRowSurface", "VideoView mount", {
      postId: post.id,
      slot: slotId,
      generation: playerGeneration,
      activeIndex,
      mode: assignment?.mode ?? null,
      status: safePlayerStatus(player),
    });
    return () => {
      devFlowLog("FlowRowSurface", "VideoView unmount", {
        postId: post.id,
        slot: slotId,
        generation: playerGeneration,
        activeIndex,
        mode: assignment?.mode ?? null,
        status: "-",
      });
    };
  }, [
    activeIndex,
    assignment?.mode,
    player,
    playerGeneration,
    post.id,
    showVideo,
    slotId,
  ]);

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

      {showVideo && player ? (
        <VideoView
          key={`${slotId}-${playerGeneration}`}
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={false}
          onFirstFrameRender={handleFirstFrameRender}
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

import { Image } from "expo-image";
import { StoryPhotoDisplay } from "@/features/media/components/StoryPhotoDisplay";
import { LinearGradient } from "expo-linear-gradient";
import { useEventListener } from "expo";
import { useEffect, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  STORY_IMAGE_DURATION_MS,
  STORY_VIDEO_MAX_DURATION_MS,
  type Story,
} from "../constants/types";

type StoryMediaLayerProps = {
  story: Story;
  active: boolean;
  onDurationResolved?: (durationMs: number) => void;
  onPlaybackReady?: () => void;
  onPlaybackEnd?: () => void;
};

export function StoryMediaLayer({
  story,
  active,
  onDurationResolved,
  onPlaybackReady,
  onPlaybackEnd,
}: StoryMediaLayerProps) {
  const { width, height } = useWindowDimensions();
  const [videoVisible, setVideoVisible] = useState(false);
  const isVideo = story.mediaType === "video";

  const player = useVideoPlayer(isVideo ? story.mediaURL : null, (instance) => {
    instance.loop = false;
    instance.muted = false;
  });

  useEffect(() => {
    if (!isVideo) {
      onDurationResolved?.(STORY_IMAGE_DURATION_MS);
      const readyTimer = setTimeout(() => {
        onPlaybackReady?.();
      }, 0);
      return () => clearTimeout(readyTimer);
    }
    setVideoVisible(false);
  }, [isVideo, onDurationResolved, onPlaybackReady, story.id]);

  useEffect(() => {
    if (!active || !isVideo) {
      player.pause();
      return;
    }
    player.play();
  }, [active, isVideo, player]);

  useEventListener(player, "statusChange", ({ status }) => {
    if (!isVideo) {
      return;
    }
    if (status === "readyToPlay") {
      setVideoVisible(true);
      onPlaybackReady?.();
      const durationSec = player.duration;
      const durationMs =
        durationSec > 0
          ? Math.min(durationSec * 1000, STORY_VIDEO_MAX_DURATION_MS)
          : STORY_VIDEO_MAX_DURATION_MS;
      onDurationResolved?.(durationMs);
    } else if (status === "error") {
      setVideoVisible(false);
      onDurationResolved?.(STORY_VIDEO_MAX_DURATION_MS);
      onPlaybackReady?.();
    }
  });

  useEventListener(player, "playToEnd", () => {
    if (!isVideo || !active) {
      return;
    }
    onPlaybackEnd?.();
  });

  useEffect(() => {
    if (!active || !isVideo) {
      return;
    }
    const fallbackTimer = setTimeout(() => {
      onDurationResolved?.(STORY_VIDEO_MAX_DURATION_MS);
      onPlaybackReady?.();
    }, 1800);
    return () => clearTimeout(fallbackTimer);
  }, [active, isVideo, onDurationResolved, onPlaybackReady, story.id]);

  return (
    <View style={{ width, height }}>
      {isVideo ? (
        <>
          {story.posterURL ? (
            <Image
              source={{ uri: story.posterURL }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFillObject, { backgroundColor: "#111" }]}
            />
          )}
          <VideoView
            player={player}
            style={{
              width,
              height,
              opacity: videoVisible ? 1 : 0,
            }}
            contentFit="cover"
            nativeControls={false}
            allowsPictureInPicture={false}
          />
        </>
      ) : (
        <StoryPhotoDisplay uri={story.mediaURL} style={StyleSheet.absoluteFillObject} />
      )}

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.55)"]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
    </View>
  );
}

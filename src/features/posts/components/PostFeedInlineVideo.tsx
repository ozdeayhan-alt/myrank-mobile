import { memo, useEffect } from "react";
import { View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import type { VideoSource } from "expo-video";
import type { Post } from "../types";
import { resolveReelVideoSource } from "../utils/resolveReelVideoSource";

type PostFeedInlineVideoProps = {
  post: Post;
  width: number;
  height: number;
};

type PostFeedInlineVideoPlayerProps = {
  post: Post;
  source: VideoSource;
  width: number;
  height: number;
};

function PostFeedInlineVideoPlayer({
  post,
  source,
  width,
  height,
}: PostFeedInlineVideoPlayerProps) {
  const player = useVideoPlayer(source, (instance) => {
    instance.muted = true;
    instance.loop = true;
  });

  useEffect(() => {
    player.play();
    return () => {
      player.pause();
    };
  }, [player, post.id]);

  return (
    <VideoView
      player={player}
      style={{ width, height }}
      contentFit="cover"
      nativeControls={false}
      allowsPictureInPicture={false}
    />
  );
}

function PostFeedInlineVideoInner({
  post,
  width,
  height,
}: PostFeedInlineVideoProps) {
  const source = resolveReelVideoSource(post);

  if (!source) {
    return <View style={{ width, height }} className="bg-gray-900" />;
  }

  return (
    <PostFeedInlineVideoPlayer
      post={post}
      source={source}
      width={width}
      height={height}
    />
  );
}

export const PostFeedInlineVideo = memo(PostFeedInlineVideoInner);

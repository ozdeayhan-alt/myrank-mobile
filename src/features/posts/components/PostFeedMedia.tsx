import { memo, useMemo } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { resolveMediaDisplayUrl, resolveVideoPosterUrl } from "@/lib/media/resolveMediaDisplayUrl";
import { useMediaAspectRatio } from "../hooks/useMediaAspectRatio";
import type { Post } from "../types";
import {
  DEFAULT_VIDEO_ASPECT_RATIO,
  feedMediaLayout,
  feedVideoMediaLayout,
  MAX_FEED_MEDIA_HEIGHT,
  normalizeAspectRatio,
} from "../utils/mediaAspectRatio";
import { isVideoPost } from "../utils/videoPosts";
import { PostFeedInlineVideo } from "./PostFeedInlineVideo";

/** Parent ScrollView content uses px-4 — medyayı kenardan kenara göster */
const FEED_HORIZONTAL_INSET = 16;

const COMPACT_MEDIA_HEIGHT = 160;

type ImagePriority = "low" | "normal" | "high";

function storedAspectRatio(post: Post): number | null {
  if (
    typeof post.mediaWidth === "number" &&
    typeof post.mediaHeight === "number" &&
    post.mediaWidth > 0 &&
    post.mediaHeight > 0
  ) {
    return normalizeAspectRatio(post.mediaWidth, post.mediaHeight);
  }
  return null;
}

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

type PostFeedMediaProps = {
  post: Post;
  variant?: "feed" | "compact";
  imagePriority?: ImagePriority;
  placeholderHeight?: number;
  inlineAutoplay?: boolean;
};

type PostFeedMediaLayoutProps = PostFeedMediaProps & {
  aspectRatio: number;
  fixedHeight?: number;
};

function PostFeedMediaLayout({
  post,
  variant = "feed",
  aspectRatio,
  imagePriority = "normal",
  fixedHeight,
  inlineAutoplay = false,
}: PostFeedMediaLayoutProps) {
  const { width: screenWidth } = useWindowDimensions();
  const compact = variant === "compact";

  const imageCacheProps = useMemo(
    () => ({
      cachePolicy: "memory-disk" as const,
      recyclingKey: post.id,
      priority: imagePriority,
    }),
    [post.id, imagePriority]
  );

  const displayMediaURL = resolveMediaDisplayUrl(post.mediaURL);

  if (!displayMediaURL) {
    return null;
  }

  const containerWidth = compact ? screenWidth - 48 : screenWidth;
  const isVideo = post.contentType === "video" && isVideoPost(post);
  const imageMaxHeight = compact ? COMPACT_MEDIA_HEIGHT : MAX_FEED_MEDIA_HEIGHT;
  const layout =
    fixedHeight != null
      ? {
          containerWidth,
          width: containerWidth,
          height: fixedHeight,
        }
      : isVideo
        ? feedVideoMediaLayout(
            containerWidth,
            aspectRatio,
            compact ? COMPACT_MEDIA_HEIGHT : undefined
          )
        : feedMediaLayout(containerWidth, aspectRatio, imageMaxHeight);

  const outerStyle = compact
    ? { width: "100%" as const }
    : {
        width: layout.containerWidth,
        marginLeft: -FEED_HORIZONTAL_INSET,
        marginRight: -FEED_HORIZONTAL_INSET,
      };

  const frameStyle = {
    width: layout.width,
    height: layout.height,
  };

  if (post.contentType === "image") {
    return (
      <View style={outerStyle} className="items-center bg-black">
        <View style={frameStyle}>
          <Image
            source={{ uri: displayMediaURL }}
            style={{ width: "100%", height: "100%" }}
            contentFit={compact ? "cover" : "contain"}
            {...imageCacheProps}
          />
        </View>
      </View>
    );
  }

  if (!isVideo) {
    return null;
  }

  const posterUri = resolveVideoPosterUrl(post);

  if (inlineAutoplay) {
    return (
      <View style={outerStyle} className="items-center bg-black">
        <View style={frameStyle} className="overflow-hidden bg-black">
          <PostFeedInlineVideo
            post={post}
            width={layout.width}
            height={layout.height}
          />
          {!inlineAutoplay ? <PlayOverlay /> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={outerStyle} className="items-center bg-black">
      <View style={frameStyle} className="bg-black">
        {posterUri ? (
          <>
            <Image
              source={{ uri: posterUri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              {...imageCacheProps}
            />
            <PlayOverlay />
          </>
        ) : (
          <>
            <View className="h-full w-full bg-gray-900" />
            <PlayOverlay />
          </>
        )}
      </View>
    </View>
  );
}

function PostFeedMediaDynamic({
  post,
  variant = "feed",
  imagePriority = "normal",
  placeholderHeight,
  inlineAutoplay = false,
}: PostFeedMediaProps) {
  const imageAspectRatio = useMediaAspectRatio(
    post.contentType === "image" ? post.mediaURL : undefined,
    post.contentType === "image" ? "image" : undefined
  );

  const posterAspectRatio = useMediaAspectRatio(
    post.contentType === "video" && post.posterURL?.trim()
      ? post.posterURL
      : undefined,
    post.contentType === "video" && post.posterURL?.trim() ? "image" : undefined
  );

  const aspectRatio =
    post.contentType === "image"
      ? imageAspectRatio
      : post.posterURL?.trim()
        ? posterAspectRatio
        : DEFAULT_VIDEO_ASPECT_RATIO;

  return (
    <PostFeedMediaLayout
      post={post}
      variant={variant}
      aspectRatio={aspectRatio}
      imagePriority={imagePriority}
      fixedHeight={placeholderHeight}
      inlineAutoplay={inlineAutoplay}
    />
  );
}

function PostFeedMediaInner({
  post,
  variant = "feed",
  imagePriority = "normal",
  placeholderHeight,
  inlineAutoplay = false,
}: PostFeedMediaProps) {
  const storedRatio = storedAspectRatio(post);

  if (placeholderHeight != null && storedRatio == null) {
    return (
      <PostFeedMediaLayout
        post={post}
        variant={variant}
        aspectRatio={DEFAULT_VIDEO_ASPECT_RATIO}
        imagePriority={imagePriority}
        fixedHeight={placeholderHeight}
        inlineAutoplay={inlineAutoplay}
      />
    );
  }

  if (storedRatio != null) {
    return (
      <PostFeedMediaLayout
        post={post}
        variant={variant}
        aspectRatio={storedRatio}
        imagePriority={imagePriority}
        inlineAutoplay={inlineAutoplay}
      />
    );
  }

  return (
    <PostFeedMediaDynamic
      post={post}
      variant={variant}
      imagePriority={imagePriority}
      placeholderHeight={placeholderHeight}
      inlineAutoplay={inlineAutoplay}
    />
  );
}

export const PostFeedMedia = memo(PostFeedMediaInner);

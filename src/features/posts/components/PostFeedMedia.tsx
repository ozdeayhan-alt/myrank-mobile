import { FeedGlowImage } from "@/features/media/components/FeedGlowImage";
import { memo } from "react";
import { useWindowDimensions, View } from "react-native";
import { resolveMediaDisplayUrl } from "@/lib/media/resolveMediaDisplayUrl";
import { useMediaAspectRatio } from "../hooks/useMediaAspectRatio";
import {
  DEFAULT_FEED_MEDIA_LAYOUT,
  type PostFeedMediaLayoutOptions,
} from "../constants/feedMediaLayout";
import type { Post } from "../types";
import {
  feedImageMediaLayout,
  normalizeAspectRatio,
} from "../utils/mediaAspectRatio";

const COMPACT_MEDIA_HEIGHT = 160;

type ImagePriority = "low" | "normal" | "high";

function storedAspectRatio(post: Post): number | null {
  if (
    typeof post.mediaWidth !== "number" ||
    typeof post.mediaHeight !== "number" ||
    post.mediaWidth <= 0 ||
    post.mediaHeight <= 0
  ) {
    return null;
  }

  return normalizeAspectRatio(post.mediaWidth, post.mediaHeight);
}

type PostFeedMediaProps = PostFeedMediaLayoutOptions & {
  post: Post;
  variant?: "feed" | "compact";
  imagePriority?: ImagePriority;
  placeholderHeight?: number;
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
  listHorizontalInset = DEFAULT_FEED_MEDIA_LAYOUT.listHorizontalInset,
  mediaEdgeBleed = DEFAULT_FEED_MEDIA_LAYOUT.mediaEdgeBleed,
}: PostFeedMediaLayoutProps) {
  const { width: screenWidth } = useWindowDimensions();
  const compact = variant === "compact";
  const bleed = !compact && mediaEdgeBleed && listHorizontalInset > 0;

  const displayMediaURL = resolveMediaDisplayUrl(post.mediaURL);

  if (!displayMediaURL || post.contentType !== "image") {
    return null;
  }

  const containerWidth = compact
    ? screenWidth - 48
    : bleed
      ? screenWidth
      : Math.max(0, screenWidth - listHorizontalInset * 2);
  const compactMaxHeight = compact ? COMPACT_MEDIA_HEIGHT : undefined;
  const layout =
    fixedHeight != null
      ? {
          containerWidth,
          width: containerWidth,
          height: fixedHeight,
        }
      : feedImageMediaLayout(containerWidth, aspectRatio, compactMaxHeight);

  const outerStyle = compact
    ? { width: "100%" as const }
    : bleed
      ? {
          width: layout.containerWidth,
          marginLeft: -listHorizontalInset,
          marginRight: -listHorizontalInset,
        }
      : {
          width: "100%" as const,
          alignItems: "center" as const,
        };

  const frameStyle = {
    width: layout.width,
    height: layout.height,
  };

  return (
    <View style={outerStyle}>
      <View style={frameStyle}>
        <FeedGlowImage
          uri={displayMediaURL}
          recyclingKey={post.id}
          priority={imagePriority}
        />
      </View>
    </View>
  );
}

function PostFeedMediaDynamic({
  post,
  variant = "feed",
  imagePriority = "normal",
  placeholderHeight,
  listHorizontalInset,
  mediaEdgeBleed,
}: PostFeedMediaProps) {
  const imageAspectRatio = useMediaAspectRatio(
    post.contentType === "image" ? post.mediaURL : undefined,
    post.contentType === "image" ? "image" : undefined
  );

  return (
    <PostFeedMediaLayout
      post={post}
      variant={variant}
      aspectRatio={imageAspectRatio}
      imagePriority={imagePriority}
      fixedHeight={placeholderHeight}
      listHorizontalInset={listHorizontalInset}
      mediaEdgeBleed={mediaEdgeBleed}
    />
  );
}

function PostFeedMediaInner({
  post,
  variant = "feed",
  imagePriority = "normal",
  placeholderHeight,
  listHorizontalInset,
  mediaEdgeBleed,
}: PostFeedMediaProps) {
  const storedRatio = storedAspectRatio(post);

  if (post.contentType !== "image") {
    return null;
  }

  if (storedRatio != null) {
    return (
      <PostFeedMediaLayout
        post={post}
        variant={variant}
        aspectRatio={storedRatio}
        imagePriority={imagePriority}
        listHorizontalInset={listHorizontalInset}
        mediaEdgeBleed={mediaEdgeBleed}
      />
    );
  }

  return (
    <PostFeedMediaDynamic
      post={post}
      variant={variant}
      imagePriority={imagePriority}
      placeholderHeight={placeholderHeight}
      listHorizontalInset={listHorizontalInset}
      mediaEdgeBleed={mediaEdgeBleed}
    />
  );
}

export const PostFeedMedia = memo(PostFeedMediaInner);

import { ShimmerSkeleton } from "@/components/ShimmerSkeleton";
import { Image } from "expo-image";
import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { resolveFeedMediaDisplayUrls } from "@/features/feed/resolveFeedMediaDisplayUrls";
import {
  DEFAULT_FEED_MEDIA_LAYOUT,
  type PostFeedMediaLayoutOptions,
} from "../constants/feedMediaLayout";
import type { Post } from "../types";
import { resolveFeedSlotMediaLayout } from "@/features/feed/resolveFeedSlotLayout";
import { isVideoPost } from "../utils/videoPosts";

type FeedStreamMediaProps = PostFeedMediaLayoutOptions & {
  post: Post;
  onOpenVideo?: () => void;
  imagePriority?: "low" | "normal" | "high";
};

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

function FeedStreamMediaInner({
  post,
  onOpenVideo,
  imagePriority = "normal",
  listHorizontalInset = DEFAULT_FEED_MEDIA_LAYOUT.listHorizontalInset,
  mediaEdgeBleed = DEFAULT_FEED_MEDIA_LAYOUT.mediaEdgeBleed,
}: FeedStreamMediaProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [fullLoaded, setFullLoaded] = useState(false);
  const bleed = mediaEdgeBleed && listHorizontalInset > 0;
  const containerWidth = bleed
    ? screenWidth
    : Math.max(0, screenWidth - listHorizontalInset * 2);

  const layout = useMemo(
    () => resolveFeedSlotMediaLayout(post, containerWidth),
    [post.id, post.mediaWidth, post.mediaHeight, post.contentType, containerWidth]
  );

  const { previewUri, fullUri } = useMemo(
    () => resolveFeedMediaDisplayUrls(post),
    [post.id, post.mediaURL, post.posterURL, post.thumbURL, post.contentType]
  );

  useEffect(() => {
    setPreviewLoaded(false);
    setFullLoaded(false);
  }, [post.id, previewUri, fullUri]);

  const showShimmer = !previewLoaded && !fullLoaded;
  const showFullLayer =
    Boolean(fullUri) && fullUri !== previewUri && fullLoaded;

  const outerStyle = bleed
    ? {
        width: layout.containerWidth,
        marginLeft: -listHorizontalInset,
        marginRight: -listHorizontalInset,
      }
    : { width: "100%" as const };

  const frameStyle = {
    width: layout.width,
    height: layout.height,
  };

  const renderImageStack = (overlay?: ReactNode) => (
    <>
      {showShimmer ? (
        <View className="absolute inset-0">
          <ShimmerSkeleton
            width={layout.width}
            height={layout.height}
            borderRadius={0}
          />
        </View>
      ) : null}
      {previewUri ? (
        <Image
          source={{ uri: previewUri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={`${post.id}-preview`}
          priority={imagePriority}
          onLoad={() => setPreviewLoaded(true)}
        />
      ) : null}
      {fullUri && fullUri !== previewUri ? (
        <Image
          source={{ uri: fullUri }}
          style={{
            width: "100%",
            height: "100%",
            opacity: showFullLayer ? 1 : 0,
            position: "absolute",
            top: 0,
            left: 0,
          }}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={post.id}
          priority={imagePriority}
          transition={150}
          onLoad={() => setFullLoaded(true)}
        />
      ) : null}
      {overlay}
    </>
  );

  if (post.contentType === "image") {
    if (!fullUri && !previewUri) {
      return null;
    }

    return (
      <View style={outerStyle}>
        <View style={frameStyle} className="overflow-hidden bg-neutral-300">
          {renderImageStack()}
        </View>
      </View>
    );
  }

  if (!isVideoPost(post)) {
    return null;
  }

  return (
    <Pressable
      style={outerStyle}
      onPress={onOpenVideo}
      accessibilityRole="button"
      accessibilityLabel="Videoyu aç"
    >
      <View style={frameStyle} className="overflow-hidden bg-neutral-300">
        {renderImageStack(<PlayOverlay />)}
      </View>
    </Pressable>
  );
}

export const FeedStreamMedia = memo(FeedStreamMediaInner);

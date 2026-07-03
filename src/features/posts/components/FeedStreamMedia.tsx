import { ShimmerSkeleton } from "@/components/ShimmerSkeleton";
import { Image } from "expo-image";
import { memo, useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { resolveFeedMediaDisplayUrls } from "@/features/feed/resolveFeedMediaDisplayUrls";
import {
  DEFAULT_FEED_MEDIA_LAYOUT,
  type PostFeedMediaLayoutOptions,
} from "../constants/feedMediaLayout";
import type { Post } from "../types";
import { resolveFeedSlotMediaLayout } from "@/features/feed/resolveFeedSlotLayout";

type FeedStreamMediaProps = PostFeedMediaLayoutOptions & {
  post: Post;
  imagePriority?: "low" | "normal" | "high";
};

function FeedStreamMediaInner({
  post,
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
    [post.id, post.mediaURL, post.thumbURL, post.contentType]
  );

  useEffect(() => {
    setPreviewLoaded(false);
    setFullLoaded(false);
  }, [post.id, previewUri, fullUri]);

  const showShimmer = !previewLoaded && !fullLoaded;
  const showFullLayer =
    Boolean(fullUri) && fullUri !== previewUri && fullLoaded;

  if (post.contentType !== "image" || (!fullUri && !previewUri)) {
    return null;
  }

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

  return (
    <View style={outerStyle}>
      <View style={frameStyle} className="overflow-hidden bg-neutral-300">
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
      </View>
    </View>
  );
}

export const FeedStreamMedia = memo(FeedStreamMediaInner);

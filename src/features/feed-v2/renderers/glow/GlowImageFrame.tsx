import { ShimmerSkeleton } from "@/components/ShimmerSkeleton";
import { FeedGlowImage } from "@/features/media/components/FeedGlowImage";
import { resolveFeedMediaDisplayUrls } from "@/features/feed/resolveFeedMediaDisplayUrls";
import { resolveFeedSlotMediaLayout } from "@/features/feed/resolveFeedSlotLayout";
import { DEFAULT_LIST_HORIZONTAL_INSET } from "@/features/posts/constants/feedMediaLayout";
import type { Post } from "@/features/posts/types";
import { Image } from "expo-image";
import { memo, useEffect, useMemo, useState } from "react";
import { View, useWindowDimensions } from "react-native";

const loadedGlowUris = new Set<string>();

type GlowImageFrameProps = {
  post: Post;
  imagePriority?: "low" | "normal" | "high";
};

function GlowImageFrameInner({
  post,
  imagePriority = "normal",
}: GlowImageFrameProps) {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = Math.max(
    0,
    screenWidth - DEFAULT_LIST_HORIZONTAL_INSET * 2
  );

  const layout = useMemo(
    () => resolveFeedSlotMediaLayout(post, containerWidth),
    [post.id, post.mediaWidth, post.mediaHeight, containerWidth]
  );

  const { previewUri, fullUri } = useMemo(
    () => resolveFeedMediaDisplayUrls(post),
    [post.id, post.mediaURL, post.thumbURL, post.contentType]
  );

  const [previewLoaded, setPreviewLoaded] = useState(() =>
    Boolean(previewUri && loadedGlowUris.has(previewUri))
  );
  const [fullLoaded, setFullLoaded] = useState(() =>
    Boolean(fullUri && loadedGlowUris.has(fullUri))
  );
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setPreviewLoaded(Boolean(previewUri && loadedGlowUris.has(previewUri)));
    setFullLoaded(Boolean(fullUri && loadedGlowUris.has(fullUri)));
    setLoadFailed(false);
  }, [post.id, previewUri, fullUri]);

  if (!fullUri && !previewUri) {
    return null;
  }

  const showShimmer = !previewLoaded && !fullLoaded && !loadFailed;
  const showFullLayer =
    Boolean(fullUri) && fullUri !== previewUri && fullLoaded;

  const frameStyle = {
    width: layout.width,
    height: layout.height,
  };

  if (fullUri && (!previewUri || previewUri === fullUri)) {
    return (
      <View style={{ width: "100%", alignItems: "center" }}>
        <View style={frameStyle} className="overflow-hidden bg-neutral-950">
          <FeedGlowImage
            uri={fullUri}
            recyclingKey={post.id}
            priority={imagePriority}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
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
            onLoad={() => {
              loadedGlowUris.add(previewUri);
              setPreviewLoaded(true);
            }}
            onError={() => setLoadFailed(true)}
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
            transition={showFullLayer ? 0 : 150}
            onLoad={() => {
              loadedGlowUris.add(fullUri);
              setFullLoaded(true);
            }}
            onError={() => setLoadFailed(true)}
          />
        ) : null}
        {loadFailed && !previewLoaded && !fullLoaded ? (
          <View className="absolute inset-0 bg-neutral-200" />
        ) : null}
      </View>
    </View>
  );
}

export const GlowImageFrame = memo(GlowImageFrameInner);

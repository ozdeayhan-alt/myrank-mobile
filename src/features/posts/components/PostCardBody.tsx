import { useCallback } from "react";
import { Text, View } from "react-native";
import { DoubleTapToLike } from "@/components/DoubleTapToLike";
import { LikeHeartBurst } from "@/components/LikeHeartBurst";
import type { Post } from "../types";
import { postBodyText } from "../utils/postBodyText";
import {
  isRepostPost,
  resolveEmbeddedOriginalPost,
} from "../utils/repostUtils";
import { resolvePostAuthorDisplayName } from "../utils/resolvePostAuthor";
import { isVideoPost } from "../utils/videoPosts";
import { EmbeddedOriginalPost } from "./EmbeddedOriginalPost";
import { PostFeedMedia } from "./PostFeedMedia";
import { RichPostText } from "./RichPostText";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";

type PostCardBodyProps = PostFeedMediaLayoutOptions & {
  post: Post;
  heartBurstKey: number;
  onLike: () => void;
  onLikeAnimated: () => void;
  onOpenVideo?: (postId: string) => void;
  currentUserId?: string | null;
  mediaImagePriority?: "low" | "normal" | "high";
  inlineAutoplay?: boolean;
};

export function PostCardBody({
  post,
  heartBurstKey,
  onLike,
  onLikeAnimated,
  onOpenVideo,
  currentUserId = null,
  mediaImagePriority = "normal",
  inlineAutoplay = false,
  listHorizontalInset,
  mediaEdgeBleed,
}: PostCardBodyProps) {
  const embeddedOriginal = resolveEmbeddedOriginalPost(post);
  const repostAttribution =
    isRepostPost(post) && embeddedOriginal
      ? `${resolvePostAuthorDisplayName(post)}, ${resolvePostAuthorDisplayName(embeddedOriginal)} adlı kullanıcının gönderisini paylaştı`
      : null;
  const bodyText = postBodyText(post);

  const openVideo = useCallback(() => {
    if (isVideoPost(post)) {
      onOpenVideo?.(post.id);
    }
  }, [post, onOpenVideo]);

  return (
    <View className="relative" style={{ minHeight: 80 }}>
      {isRepostPost(post) ? (
        <>
          {repostAttribution ? (
            <View className="px-4 pb-2 pt-1">
              <Text className="text-xs text-gray-500">{repostAttribution}</Text>
            </View>
          ) : null}
          {bodyText ? (
            <View className="px-4 pb-3">
              <RichPostText content={bodyText} currentUserId={currentUserId} />
            </View>
          ) : null}
          {embeddedOriginal ? (
            <EmbeddedOriginalPost
              post={embeddedOriginal}
              onOpenVideo={onOpenVideo}
              currentUserId={currentUserId}
              listHorizontalInset={listHorizontalInset}
              mediaEdgeBleed={mediaEdgeBleed}
            />
          ) : null}
        </>
      ) : (
        <DoubleTapToLike
          onLike={onLike}
          onLikeAnimated={onLikeAnimated}
          onSinglePress={isVideoPost(post) ? openVideo : undefined}
          accessibilityLabel={
            isVideoPost(post)
              ? "Tek dokunuşla videoyu aç, çift dokunarak beğen"
              : "Çift dokunarak beğen"
          }
        >
          {bodyText && post.contentType === "tweet" ? (
            <View className="px-4 pb-3">
              <RichPostText content={bodyText} currentUserId={currentUserId} />
            </View>
          ) : null}

          <View className="relative">
            <PostFeedMedia
              post={post}
              imagePriority={mediaImagePriority}
              inlineAutoplay={inlineAutoplay}
              listHorizontalInset={listHorizontalInset}
              mediaEdgeBleed={mediaEdgeBleed}
            />
          </View>

          {bodyText && post.contentType !== "tweet" ? (
            <View className="px-4 py-3">
              <RichPostText content={bodyText} currentUserId={currentUserId} />
            </View>
          ) : null}
        </DoubleTapToLike>
      )}

      {!isRepostPost(post) ? <LikeHeartBurst burstKey={heartBurstKey} /> : null}
    </View>
  );
}

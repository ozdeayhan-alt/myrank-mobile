import { memo, useRef, type RefObject } from "react";
import { Text, View } from "react-native";
import { DoubleTapToLike } from "@/components/DoubleTapToLike";
import type { Post } from "../types";
import { postBodyText } from "../utils/postBodyText";
import {
  isRepostPost,
  resolveEmbeddedOriginalPost,
} from "../utils/repostUtils";
import { resolvePostAuthorDisplayName } from "../utils/resolvePostAuthor";
import { EmbeddedOriginalPost } from "./EmbeddedOriginalPost";
import { PostFeedMedia } from "./PostFeedMedia";
import {
  PostVoteBurstLayer,
  type PostVoteBurstHandle,
} from "./PostVoteBurstLayer";
import { RichPostText } from "./RichPostText";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";

type PostCardBodyProps = PostFeedMediaLayoutOptions & {
  post: Post;
  burstRef?: RefObject<PostVoteBurstHandle | null>;
  onLike: () => void;
  onLikeAnimated: () => void;
  currentUserId?: string | null;
  mediaImagePriority?: "low" | "normal" | "high";
};

function PostCardBodyInner({
  post,
  burstRef: externalBurstRef,
  onLike,
  onLikeAnimated,
  currentUserId = null,
  mediaImagePriority = "normal",
  listHorizontalInset,
  mediaEdgeBleed,
}: PostCardBodyProps) {
  const localBurstRef = useRef<PostVoteBurstHandle>(null);
  const burstRef = externalBurstRef ?? localBurstRef;
  const embeddedOriginal = resolveEmbeddedOriginalPost(post);
  const repostAttribution =
    isRepostPost(post) && embeddedOriginal
      ? `${resolvePostAuthorDisplayName(post)}, ${resolvePostAuthorDisplayName(embeddedOriginal)} adlı kullanıcının gönderisini paylaştı`
      : null;
  const bodyText = postBodyText(post);

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
          accessibilityLabel="Çift dokunarak beğen"
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

      {!isRepostPost(post) ? <PostVoteBurstLayer ref={burstRef} /> : null}
    </View>
  );
}

export const PostCardBody = memo(PostCardBodyInner);

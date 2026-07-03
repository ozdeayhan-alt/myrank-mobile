import { Text, View } from "react-native";
import { DoubleTapToLike } from "@/components/DoubleTapToLike";
import {
  LikeHeartBurst,
  type VoteBurstDirection,
} from "@/components/LikeHeartBurst";
import type { Post } from "../types";
import { postBodyText } from "../utils/postBodyText";
import {
  isRepostPost,
  resolveEmbeddedOriginalPost,
} from "../utils/repostUtils";
import { resolvePostAuthorDisplayName } from "../utils/resolvePostAuthor";
import { EmbeddedOriginalPost } from "./EmbeddedOriginalPost";
import { PostFeedMedia } from "./PostFeedMedia";
import { RichPostText } from "./RichPostText";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";

type PostCardBodyProps = PostFeedMediaLayoutOptions & {
  post: Post;
  voteBurstKey: number;
  voteBurstDirection: VoteBurstDirection;
  onLike: () => void;
  onLikeAnimated: () => void;
  currentUserId?: string | null;
  mediaImagePriority?: "low" | "normal" | "high";
};

export function PostCardBody({
  post,
  voteBurstKey,
  voteBurstDirection,
  onLike,
  onLikeAnimated,
  currentUserId = null,
  mediaImagePriority = "normal",
  listHorizontalInset,
  mediaEdgeBleed,
}: PostCardBodyProps) {
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

      {!isRepostPost(post) ? (
        <LikeHeartBurst
          burstKey={voteBurstKey}
          direction={voteBurstDirection}
        />
      ) : null}
    </View>
  );
}

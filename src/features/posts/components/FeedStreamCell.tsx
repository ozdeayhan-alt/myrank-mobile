import { DoubleTapToLike } from "@/components/DoubleTapToLike";
import { memo, type RefObject } from "react";
import { Platform, Text, View } from "react-native";
import type { PostCounts } from "@/features/ranking/types";
import { ui } from "@/lib/uiClasses";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";
import type { Post } from "../types";
import { postBodyText } from "../utils/postBodyText";
import {
  isRepostPost,
  resolveEmbeddedOriginalPost,
} from "../utils/repostUtils";
import { EmbeddedOriginalPost } from "./EmbeddedOriginalPost";
import { FeedStreamMedia } from "./FeedStreamMedia";
import { PostCardActionBar } from "./PostCardActionBar";
import { PostHeader } from "./PostHeader";
import { RichPostText } from "./RichPostText";
import {
  PostVoteBurstLayer,
  type PostVoteBurstHandle,
} from "./PostVoteBurstLayer";

type FeedStreamCellProps = PostFeedMediaLayoutOptions & {
  post: Post;
  burstRef?: RefObject<PostVoteBurstHandle | null>;
  counts: PostCounts;
  shareActive: boolean;
  saveActive: boolean;
  loading: boolean;
  isOwner: boolean;
  currentUserId?: string | null;
  onLike: () => void;
  onLikeAnimated: () => void;
  onLikePress: () => void;
  onDislikePress: () => void;
  onDislike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onOwnerMenu: () => void;
  onMoreMenu: () => void;
  imagePriority?: "low" | "normal" | "high";
};

function FeedStreamCellInner({
  post,
  burstRef,
  counts,
  shareActive,
  saveActive,
  loading,
  isOwner,
  currentUserId = null,
  onLike,
  onLikeAnimated,
  onLikePress,
  onDislikePress,
  onDislike,
  onComment,
  onShare,
  onSave,
  onOwnerMenu,
  onMoreMenu,
  imagePriority = "normal",
  listHorizontalInset,
  mediaEdgeBleed,
}: FeedStreamCellProps) {
  const bodyText = postBodyText(post);
  const embeddedOriginal = resolveEmbeddedOriginalPost(post);
  const repostAttribution =
    isRepostPost(post) && embeddedOriginal
      ? `${post.authorDisplayName ?? "Biri"}, ${embeddedOriginal.authorDisplayName ?? "Biri"} adlı kullanıcının gönderisini paylaştı`
      : null;

  return (
    <View
      className={ui.postCard}
      style={Platform.OS === "android" ? { elevation: 2 } : undefined}
    >
      <PostHeader
        post={post}
        isOwner={isOwner}
        currentUserId={currentUserId}
        onOwnerMenuPress={isOwner ? onOwnerMenu : undefined}
        onMoreMenuPress={!isOwner ? onMoreMenu : undefined}
      />

      {isRepostPost(post) ? (
        <>
          {repostAttribution ? (
            <View className="px-4 pb-2 pt-1">
              <Text className="text-xs text-gray-500" numberOfLines={2}>
                {repostAttribution}
              </Text>
            </View>
          ) : null}
          {bodyText ? (
            <View className="px-4 pb-3">
              <RichPostText
                content={bodyText}
                currentUserId={currentUserId}
              />
            </View>
          ) : null}
          {embeddedOriginal ? (
            <EmbeddedOriginalPost
              post={embeddedOriginal}
              currentUserId={currentUserId}
              listHorizontalInset={listHorizontalInset}
              mediaEdgeBleed={mediaEdgeBleed}
              streamMedia
              imagePriority={imagePriority}
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
              <RichPostText
                content={bodyText}
                currentUserId={currentUserId}
              />
            </View>
          ) : null}

          <FeedStreamMedia
            post={post}
            imagePriority={imagePriority}
            listHorizontalInset={listHorizontalInset}
            mediaEdgeBleed={mediaEdgeBleed}
          />

          {bodyText && post.contentType !== "tweet" ? (
            <View className="px-4 py-3">
              <RichPostText
                content={bodyText}
                currentUserId={currentUserId}
              />
            </View>
          ) : null}

          <PostVoteBurstLayer ref={burstRef} />
        </DoubleTapToLike>
      )}

      <PostCardActionBar
        counts={counts}
        shareActive={shareActive}
        saveActive={saveActive}
        loading={loading}
        onLikePress={onLikePress}
        onDislikePress={onDislikePress}
        onCommentPress={onComment}
        onSharePress={onShare}
        onSavePress={onSave}
      />
    </View>
  );
}

export const FeedStreamCell = memo(FeedStreamCellInner);

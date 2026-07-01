import type { VoteBurstDirection } from "@/components/LikeHeartBurst";
import { DoubleTapToLike } from "@/components/DoubleTapToLike";
import {
  LikeHeartBurst,
} from "@/components/LikeHeartBurst";
import { memo } from "react";
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
import { isVideoPost } from "../utils/videoPosts";
import { EmbeddedOriginalPost } from "./EmbeddedOriginalPost";
import { FeedStreamMedia } from "./FeedStreamMedia";
import { PostCardActionBar } from "./PostCardActionBar";
import { PostHeader } from "./PostHeader";
import { RichPostText } from "./RichPostText";

type FeedStreamCellProps = PostFeedMediaLayoutOptions & {
  post: Post;
  score: number;
  counts: PostCounts;
  shareActive: boolean;
  saveActive: boolean;
  loading: boolean;
  isOwner: boolean;
  currentUserId?: string | null;
  voteBurstKey: number;
  voteBurstDirection: VoteBurstDirection;
  onLike: () => void;
  onLikeAnimated: () => void;
  onDislike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onOwnerMenu: () => void;
  onMoreMenu: () => void;
  onOpenVideo?: (postId: string) => void;
  imagePriority?: "low" | "normal" | "high";
};

function FeedStreamCellInner({
  post,
  score,
  counts,
  shareActive,
  saveActive,
  loading,
  isOwner,
  currentUserId = null,
  voteBurstKey,
  voteBurstDirection,
  onLike,
  onLikeAnimated,
  onDislike,
  onComment,
  onShare,
  onSave,
  onOwnerMenu,
  onMoreMenu,
  onOpenVideo,
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

  const openVideo = () => {
    if (isVideoPost(post)) {
      onOpenVideo?.(post.id);
    }
  };

  return (
    <View
      className={ui.postCard}
      style={Platform.OS === "android" ? { elevation: 2 } : undefined}
    >
      <PostHeader
        post={post}
        score={score}
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
              onOpenVideo={onOpenVideo}
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
          onSinglePress={isVideoPost(post) ? openVideo : undefined}
          accessibilityLabel={
            isVideoPost(post)
              ? "Tek dokunuşla videoyu aç, çift dokunarak beğen"
              : "Çift dokunarak beğen"
          }
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
            onOpenVideo={openVideo}
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

          <LikeHeartBurst
            burstKey={voteBurstKey}
            direction={voteBurstDirection}
          />
        </DoubleTapToLike>
      )}

      <PostCardActionBar
        counts={counts}
        shareActive={shareActive}
        saveActive={saveActive}
        loading={loading}
        onLikePress={onLike}
        onDislikePress={onDislike}
        onCommentPress={onComment}
        onSharePress={onShare}
        onSavePress={onSave}
      />
    </View>
  );
}

export const FeedStreamCell = memo(FeedStreamCellInner);

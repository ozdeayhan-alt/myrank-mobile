import { DoubleTapToLike } from "@/components/DoubleTapToLike";
import { memo } from "react";
import { Platform, Text, View } from "react-native";
import type { PostCounts } from "@/features/ranking/types";
import { ui } from "@/lib/uiClasses";
import type { PostFeedMediaLayoutOptions } from "../constants/feedMediaLayout";
import type { PostVoteButtonPulse } from "../hooks/usePostVoteFeedback";
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
import { WHISP_BODY_TEXT_CLASS } from "../constants/whispTypography";
import { RichPostText } from "./RichPostText";
import { WhispLinkCard } from "./WhispLinkCard";
import type { PostVoteFountainHandle } from "./PostVoteFountainLayer";
import { PostVoteFountainLayer } from "./PostVoteFountainLayer";
import type { RefObject } from "react";

type FeedStreamCellProps = PostFeedMediaLayoutOptions & {
  post: Post;
  fountainRef: RefObject<PostVoteFountainHandle | null>;
  buttonPulseSeq: number;
  lastButtonPulse: PostVoteButtonPulse | null;
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
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onOwnerMenu: () => void;
  onMoreMenu: () => void;
  imagePriority?: "low" | "normal" | "high";
};

function FeedStreamCellInner({
  post,
  fountainRef,
  buttonPulseSeq,
  lastButtonPulse,
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
      style={Platform.OS === "android" ? { elevation: 2, position: "relative" } : { position: "relative" }}
    >
      <PostHeader
        post={post}
        isOwner={isOwner}
        currentUserId={currentUserId}
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
                className={WHISP_BODY_TEXT_CLASS}
                currentUserId={currentUserId}
              />
            </View>
          ) : null}

          <WhispLinkCard post={post} />

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
        onMenuPress={isOwner ? onOwnerMenu : onMoreMenu}
        menuAccessibilityLabel="Gönderi seçenekleri"
        fountainRef={fountainRef}
        buttonPulseSeq={buttonPulseSeq}
        lastButtonPulse={lastButtonPulse}
      />

      <PostVoteFountainLayer ref={fountainRef} />
    </View>
  );
}

export const FeedStreamCell = memo(FeedStreamCellInner);

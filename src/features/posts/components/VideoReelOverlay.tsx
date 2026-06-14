import { useCallback, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth";
import { LikeHeartBurst } from "@/components/LikeHeartBurst";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import type { EngagementStatus } from "@/features/ranking/types";
import { useBonusPressHandlers } from "../hooks/useLikePressHandlers";
import { BonusPointsPicker } from "./LikePointsPicker";
import { useShareAndRepost } from "../hooks/useShareAndRepost";
import type { Post } from "../types";
import {
  resolvePostAuthorDisplayName,
  resolvePostAuthorInitial,
  resolvePostAuthorPhotoURL,
} from "../utils/resolvePostAuthor";
import { useOpenCommentSheet } from "../hooks/useOpenCommentSheet";
import { PostInteractionRail } from "./PostInteractionRail";
import { RepostQuoteModal } from "./RepostQuoteModal";
import { isRepostPost } from "../utils/repostUtils";

type VideoReelOverlayProps = {
  post: Post;
  engagement?: EngagementStatus;
  onEngagementPatch?: (patch: Partial<EngagementStatus>) => void;
  onScoreUpdate?: (postId: string, postScore: number) => void;
};

export function VideoReelOverlay({
  post,
  engagement,
  onEngagementPatch,
  onScoreUpdate,
}: VideoReelOverlayProps) {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const openCommentSheet = useOpenCommentSheet();

  const {
    score,
    counts,
    loading,
    liked,
    disliked,
    handleLike,
    handleDislike,
    openLikeBonusPicker,
    closeLikeBonusPicker,
    applyLikeBonus,
    openDislikeBonusPicker,
    closeDislikeBonusPicker,
    applyDislikeBonus,
    likeBonusPickerOpen,
    dislikeBonusPickerOpen,
    likeBonusPoints,
    dislikeBonusPoints,
    handleSharePress,
    handleSave,
    applyCommentResult,
    shareActive,
    saveActive,
    repostOpen,
    setRepostOpen,
    handleReposted,
  } = useShareAndRepost({
    post,
    engagement,
    onEngagementPatch,
    onScoreUpdate,
  });

  const [heartBurstKey, setHeartBurstKey] = useState(0);
  const triggerLikeHeart = useCallback(() => {
    setHeartBurstKey((k) => k + 1);
  }, []);

  const { onPress: handleLikePress, onLongPress: handleLikeLongPress } =
    useBonusPressHandlers({
      active: liked,
      onToggle: () => {
        const willLike = !liked;
        handleLike();
        if (willLike) {
          triggerLikeHeart();
        }
      },
      onOpenBonusPicker: openLikeBonusPicker,
    });

  const { onPress: handleDislikePress, onLongPress: handleDislikeLongPress } =
    useBonusPressHandlers({
      active: disliked,
      onToggle: handleDislike,
      onOpenBonusPicker: openDislikeBonusPicker,
    });

  const caption = post.content?.trim();
  const displayName = resolvePostAuthorDisplayName(post);

  return (
    <View
      pointerEvents="box-none"
      style={{ width, height, zIndex: 20 }}
      className="absolute inset-0"
    >
      <LikeHeartBurst burstKey={heartBurstKey} />

      <PostInteractionRail
        variant="reels"
        counts={counts}
        shareActive={shareActive}
        saveActive={saveActive}
        likeActive={liked}
        dislikeActive={disliked}
        loading={loading}
        onLike={handleLikePress}
        onLikeLongPress={handleLikeLongPress}
        likeBonusLabel={
          likeBonusPoints ? String(likeBonusPoints) : null
        }
        onDislike={handleDislikePress}
        onDislikeLongPress={handleDislikeLongPress}
        dislikeBonusLabel={
          dislikeBonusPoints ? String(dislikeBonusPoints) : null
        }
        onComment={() => openCommentSheet(post.id, applyCommentResult)}
        onShare={handleSharePress}
        onSave={handleSave}
      />

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-20"
        style={{ bottom: insets.bottom + 16, paddingLeft: 16 }}
      >
        <Pressable
          className="flex-row items-center"
          onPress={() =>
            navigateToAuthorProfile(post.authorId, user?.uid, {
              displayName,
              photoURL: resolvePostAuthorPhotoURL(post),
            })
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${displayName} profilini aç`}
        >
          <ProfileAvatar
            size={44}
            photoURL={resolvePostAuthorPhotoURL(post)}
            fallbackLetter={resolvePostAuthorInitial(post)}
          />
          <Text
            className="ml-3 flex-1 text-base font-semibold text-white"
            numberOfLines={1}
          >
            {displayName}
          </Text>
        </Pressable>
        {caption ? (
          <Text className="mt-2 text-sm text-white/95" numberOfLines={4}>
            {caption}
          </Text>
        ) : null}
        <Text className="mt-2 text-xs text-white/70">Puan: {score}</Text>
      </View>

      <BonusPointsPicker
        variant="like"
        visible={likeBonusPickerOpen}
        currentBonus={likeBonusPoints}
        submitting={loading}
        onSelect={applyLikeBonus}
        onClose={closeLikeBonusPicker}
      />

      <BonusPointsPicker
        variant="dislike"
        visible={dislikeBonusPickerOpen}
        currentBonus={dislikeBonusPoints}
        submitting={loading}
        onSelect={applyDislikeBonus}
        onClose={closeDislikeBonusPicker}
      />

      {!isRepostPost(post) ? (
        <RepostQuoteModal
          visible={repostOpen}
          post={post}
          onClose={() => setRepostOpen(false)}
          onReposted={handleReposted}
        />
      ) : null}

    </View>
  );
}

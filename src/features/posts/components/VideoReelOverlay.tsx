import { useCallback, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth";
import { LikeHeartBurst } from "@/components/LikeHeartBurst";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import {
  useEngagementStore,
  usePostEngagement,
} from "@/features/ranking/store/useEngagementStore";
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
  onScoreUpdate?: (postId: string, postScore: number) => void;
  /** Tab bar üstünde kalmak için; modalda varsayılan safe-area bottom */
  bottomInset?: number;
};

export function VideoReelOverlay({
  post,
  onScoreUpdate,
  bottomInset,
}: VideoReelOverlayProps) {
  const engagement = usePostEngagement(post.id);
  const patchEngagement = useEngagementStore((s) => s.patchEngagement);
  const onEngagementPatch = useCallback(
    (patch: Parameters<typeof patchEngagement>[1]) => {
      patchEngagement(post.id, patch);
    },
    [patchEngagement, post.id]
  );
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const resolvedBottomInset = bottomInset ?? insets.bottom;
  const openCommentSheet = useOpenCommentSheet();

  const {
    score,
    counts,
    loading,
    handleLike,
    handleDislike,
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

  const handleLikePress = useCallback(() => {
    handleLike();
    triggerLikeHeart();
  }, [handleLike, triggerLikeHeart]);

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
        bottomInset={resolvedBottomInset}
        counts={counts}
        shareActive={shareActive}
        saveActive={saveActive}
        loading={loading}
        onLike={handleLikePress}
        onDislike={handleDislike}
        onComment={() => openCommentSheet(post.id, applyCommentResult)}
        onShare={handleSharePress}
        onSave={handleSave}
      />

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-20"
        style={{ bottom: resolvedBottomInset + 16, paddingLeft: 16 }}
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

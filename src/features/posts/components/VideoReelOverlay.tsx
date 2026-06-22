import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth";
import { LikeHeartBurst } from "@/components/LikeHeartBurst";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import { isSystemProfileUserId } from "@/lib/profile/isSystemProfile";
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
import { PostScorePill } from "./PostScorePill";
import { PostVoteCirclePair } from "./PostVoteCirclePair";
import { PostShareModals } from "./PostShareModals";
import { ReelFollowChip } from "./ReelFollowChip";

const AVATAR_SIZE = 44;
const VOTE_ABOVE_AVATAR_GAP = 10;

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
  const avatarRowRef = useRef<View>(null);
  const [voteBarBottom, setVoteBarBottom] = useState<number | null>(null);

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
    shareSheetOpen,
    setShareSheetOpen,
    repostOpen,
    setRepostOpen,
    handleReposted,
    canRepost,
    handleRepostSelect,
    handleStorySelect,
    handleExternalShareSelect,
  } = useShareAndRepost({
    post,
    currentUserId: user?.uid ?? null,
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
  const bottomBlockBottom = resolvedBottomInset + 16;
  const isOwnReel = Boolean(user?.uid && post.authorId === user.uid);
  const showFollowChip =
    Boolean(user?.uid) &&
    !isOwnReel &&
    !isSystemProfileUserId(post.authorId);

  const syncVoteBarPosition = useCallback(() => {
    avatarRowRef.current?.measureInWindow((_x, y) => {
      setVoteBarBottom(height - y + VOTE_ABOVE_AVATAR_GAP);
    });
  }, [height]);

  useEffect(() => {
    syncVoteBarPosition();
  }, [syncVoteBarPosition, caption, score, displayName, bottomBlockBottom]);

  return (
    <View
      pointerEvents="box-none"
      style={{ width, height, zIndex: 20 }}
      className="absolute inset-0"
    >
      <LikeHeartBurst burstKey={heartBurstKey} />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: insets.top + 10,
          right: 12,
          zIndex: 22,
        }}
      >
        <PostScorePill score={score} variant="reels" />
      </View>

      <PostInteractionRail
        bottomInset={resolvedBottomInset}
        counts={counts}
        shareActive={shareActive}
        saveActive={saveActive}
        loading={loading}
        onComment={() => openCommentSheet(post.id, applyCommentResult)}
        onShare={handleSharePress}
        onSave={handleSave}
      />

      {voteBarBottom != null ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: voteBarBottom,
            alignItems: "center",
            zIndex: 22,
          }}
        >
          <PostVoteCirclePair
            variant="reels"
            disabled={loading}
            onUp={handleLikePress}
            onDown={handleDislike}
          />
        </View>
      ) : null}

      <View
        pointerEvents="box-none"
        className="absolute left-0 right-20"
        style={{ bottom: bottomBlockBottom, paddingLeft: 16 }}
      >
        <View
          ref={avatarRowRef}
          onLayout={syncVoteBarPosition}
          className="flex-row items-center"
        >
          <Pressable
            className="min-w-0 flex-1 flex-row items-center"
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
              size={AVATAR_SIZE}
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
          {showFollowChip ? (
            <ReelFollowChip targetUserId={post.authorId} />
          ) : null}
        </View>
        {caption ? (
          <Text className="mt-2 text-sm text-white/95" numberOfLines={4}>
            {caption}
          </Text>
        ) : null}
      </View>

      <PostShareModals
        post={post}
        shareSheetOpen={shareSheetOpen}
        onCloseShareSheet={() => setShareSheetOpen(false)}
        repostOpen={repostOpen}
        onCloseRepost={() => setRepostOpen(false)}
        canRepost={canRepost}
        shareLoading={loading}
        onRepostSelect={handleRepostSelect}
        onStorySelect={handleStorySelect}
        onExternalShare={handleExternalShareSelect}
        onReposted={handleReposted}
      />
    </View>
  );
}

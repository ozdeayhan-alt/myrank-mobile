import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import {
  FLOW_VOTE_GLASS,
  FLOW_VOTE_THEMES,
} from "@/features/flow/constants/flowVoteTheme";
import { ProfileVoteCircleButton } from "@/features/profile/components/ProfileVoteCircleButton";
import { PostFollowPlusButton } from "@/features/posts/components/PostFollowPlusButton";
import { PostScoreDisplay } from "@/features/posts/components/PostScoreDisplay";
import type { Post } from "@/features/posts/types";
import {
  resolvePostAuthorDisplayName,
  resolvePostAuthorInitial,
  resolvePostAuthorPhotoURL,
} from "@/features/posts/utils/resolvePostAuthor";
import type { PostCounts } from "@/features/ranking/types";

const VOTE_DIAMETER = 46;
const SIDE_ACTION_WIDTH = 56;
const TOP_SCORE_EXTRA = 8;
const BOTTOM_PAD = 16;
const VOTE_TO_AUTHOR_GAP = 10;
/** Alçalt/Yükselt çiftini yazar satırından yukarı taşır (~2 tık). */
const VOTE_LIFT = 28;
const BACK_SIZE = 40;

type FlowDetailOverlaysProps = {
  post: Post;
  currentUserId?: string | null;
  counts: PostCounts;
  postScore: number;
  shareActive: boolean;
  saveActive: boolean;
  voteLoading: boolean;
  /** Blocks accidental embed taps (YouTube pause chrome). Off for TikTok etc. */
  tapShieldEnabled?: boolean;
  onLike: () => void;
  onDislike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onMenuPress?: () => void;
};

type SideActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
  disabled?: boolean;
};

function SideAction({
  icon,
  label,
  active = false,
  onPress,
  disabled = false,
}: SideActionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.sideAction,
        {
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.sideIconWrap}>
        <Ionicons
          name={icon}
          size={24}
          color={active ? "#93C5FD" : "#FFFFFF"}
        />
      </View>
      <Text style={styles.sideLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export const FlowDetailOverlays = memo(function FlowDetailOverlays({
  post,
  currentUserId = null,
  counts,
  postScore,
  shareActive,
  saveActive,
  voteLoading,
  tapShieldEnabled = false,
  onLike,
  onDislike,
  onComment,
  onShare,
  onSave,
  onMenuPress,
}: FlowDetailOverlaysProps) {
  const insets = useSafeAreaInsets();
  const displayName = resolvePostAuthorDisplayName(post);
  const photoURL = resolvePostAuthorPhotoURL(post);
  const caption = post.content?.trim() || post.title?.trim() || null;
  const bottomInset = Math.max(insets.bottom, 8) + BOTTOM_PAD;
  const topInset = Math.max(insets.top, 8) + TOP_SCORE_EXTRA;
  const isOwner = Boolean(currentUserId && post.authorId === currentUserId);
  const showFollowCta = Boolean(currentUserId) && !isOwner;

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {tapShieldEnabled ? (
        <View style={styles.tapShield} pointerEvents="auto" />
      ) : null}

      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)");
          }
        }}
        style={[styles.backButton, { top: topInset, left: 12 }]}
        accessibilityRole="button"
        accessibilityLabel="Geri"
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
      </Pressable>

      {onMenuPress ? (
        <Pressable
          onPress={onMenuPress}
          style={[styles.menuButton, { top: topInset, right: 12 }]}
          accessibilityRole="button"
          accessibilityLabel="Gönderi seçenekleri"
          hitSlop={8}
        >
          <Text style={styles.menuEllipsis}>⋯</Text>
        </Pressable>
      ) : null}

      <View
        pointerEvents="box-none"
        style={[styles.topRow, { top: topInset + 4 }]}
      >
        <PostScoreDisplay postId={post.id} initialScore={postScore} />
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.sideRail, { bottom: bottomInset + 120 }]}
      >
        <SideAction
          icon="chatbubble-outline"
          label={String(counts.commentCount)}
          onPress={onComment}
          disabled={voteLoading}
        />
        <SideAction
          icon="paper-plane-outline"
          label={String(counts.shareCount)}
          active={shareActive}
          onPress={onShare}
          disabled={voteLoading}
        />
        <SideAction
          icon="bookmark-outline"
          label={String(counts.saveCount)}
          active={saveActive}
          onPress={onSave}
          disabled={voteLoading}
        />
      </View>

      <View
        pointerEvents="box-none"
        style={[styles.bottomStack, { paddingBottom: bottomInset }]}
      >
        <View style={[styles.votePair, { transform: [{ translateY: -VOTE_LIFT }] }]}>
          <ProfileVoteCircleButton
            direction="down"
            onPress={onDislike}
            disabled={voteLoading}
            diameter={VOTE_DIAMETER}
            showLabel
            surface="glass"
            themeOverride={FLOW_VOTE_THEMES.down}
            glassConfig={FLOW_VOTE_GLASS}
            accessibilityLabel="Alçalt, gönderi puanından 1 düşür"
          />
          <ProfileVoteCircleButton
            direction="up"
            onPress={onLike}
            disabled={voteLoading}
            diameter={VOTE_DIAMETER}
            showLabel
            surface="glass"
            themeOverride={FLOW_VOTE_THEMES.up}
            glassConfig={FLOW_VOTE_GLASS}
            accessibilityLabel="Yükselt, gönderi puanına 1 ekle"
          />
        </View>

        <View style={styles.authorRow}>
          <Pressable
            onPress={() =>
              navigateToAuthorProfile(post.authorId, currentUserId ?? undefined, {
                displayName,
                photoURL,
              })
            }
            style={styles.authorIdentity}
            accessibilityRole="button"
            accessibilityLabel={`${displayName} profilini aç`}
          >
            <ProfileAvatar
              photoURL={photoURL}
              fallbackLetter={resolvePostAuthorInitial(post)}
              size={40}
            />
            <Text style={styles.authorName} numberOfLines={1}>
              {displayName}
            </Text>
          </Pressable>
          {showFollowCta ? (
            <PostFollowPlusButton
              targetUserId={post.authorId}
              variant="ghost"
            />
          ) : null}
        </View>

        {caption ? (
          <Text style={styles.caption} numberOfLines={4}>
            {caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
  },
  tapShield: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    elevation: 1,
  },
  backButton: {
    position: "absolute",
    width: BACK_SIZE,
    height: BACK_SIZE,
    borderRadius: BACK_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 40,
    elevation: 40,
  },
  menuButton: {
    position: "absolute",
    width: BACK_SIZE,
    height: BACK_SIZE,
    borderRadius: BACK_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 40,
    elevation: 40,
  },
  menuEllipsis: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: -4,
  },
  topRow: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
    elevation: 20,
  },
  sideRail: {
    position: "absolute",
    right: 10,
    alignItems: "center",
    gap: 14,
    zIndex: 20,
    elevation: 20,
  },
  sideAction: {
    width: SIDE_ACTION_WIDTH,
    alignItems: "center",
  },
  sideIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  sideLabel: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  bottomStack: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 0,
    zIndex: 30,
    elevation: 30,
    alignItems: "stretch",
  },
  votePair: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    marginBottom: VOTE_TO_AUTHOR_GAP + VOTE_LIFT,
  },
  authorRow: {
    alignSelf: "stretch",
    maxWidth: "88%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authorIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
    flexShrink: 1,
  },
  authorName: {
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 160,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    marginTop: 8,
    alignSelf: "stretch",
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

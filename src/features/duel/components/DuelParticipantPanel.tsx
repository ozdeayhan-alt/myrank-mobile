import { memo, useCallback, useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { ProfileVoteCircleButton } from "@/features/profile/components/ProfileVoteCircleButton";
import { DuelFramedGlow } from "@/features/media/components/DuelFramedGlow";
import { resolveFeedMediaDisplayUrls } from "@/features/feed/resolveFeedMediaDisplayUrls";
import type { Post } from "@/features/posts/types";
import {
  resolvePostAuthorDisplayName,
  resolvePostAuthorInitial,
  resolvePostAuthorPhotoURL,
} from "@/features/posts/utils/resolvePostAuthor";
import {
  getDuelVoteOverlayBottom,
  getProfileVoteControlLayout,
} from "../lib/duelVoteRowLayout";
import {
  DUEL_ROUND_AVATAR_SIZE,
  DUEL_ROUND_COUNTDOWN_SIZE,
  DUEL_ROUND_GLOW_BORDER_RADIUS,
  DUEL_ROUND_GLOW_BOTTOM_PADDING,
  DUEL_ROUND_GLOW_HORIZONTAL_PADDING,
  DUEL_ROUND_GLOW_TOP_PADDING,
  DUEL_ROUND_NAME_FONT_SIZE,
  DUEL_ROUND_SCORE_PILL_OVERLAP,
  DUEL_ROUND_TAB_HORIZONTAL_PADDING,
  DUEL_ROUND_TAB_ROW_HEIGHT,
} from "../lib/duelRoundLayout";
import { DuelDigitalCountdown } from "./DuelDigitalCountdown";
import { DuelAlarmScorePill } from "./DuelAlarmScorePill";

type DuelFullScreenRoundProps = {
  post: Post;
  secondsLeft: number;
  sessionNet: number;
  onUp: () => void;
  onDown: () => void;
  onSwipeToNext?: () => void;
  votingEnabled?: boolean;
};

function DuelFullScreenRoundInner({
  post,
  secondsLeft,
  sessionNet,
  onUp,
  onDown,
  onSwipeToNext,
  votingEnabled = true,
}: DuelFullScreenRoundProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const voteLayout = useMemo(
    () => getProfileVoteControlLayout(screenWidth),
    [screenWidth]
  );
  const voteOverlayBottom = useMemo(() => {
    const base = getDuelVoteOverlayBottom(screenHeight, voteLayout.voteDiameter);
    return Math.max(insets.bottom + 20, base);
  }, [screenHeight, voteLayout.voteDiameter, insets.bottom]);

  const photoURL = resolvePostAuthorPhotoURL(post);
  const initial = resolvePostAuthorInitial(post);
  const displayName = resolvePostAuthorDisplayName(post);
  const { fullUri, previewUri } = useMemo(
    () => resolveFeedMediaDisplayUrls(post),
    [post.id, post.mediaURL, post.thumbURL, post.contentType]
  );
  const imageUri = fullUri ?? previewUri;

  const handleSwipeToNext = useCallback(() => {
    onSwipeToNext?.();
  }, [onSwipeToNext]);

  const swipeGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-24, 24])
        .onEnd((event) => {
          if (event.translationX < -48) {
            runOnJS(handleSwipeToNext)();
          }
        }),
    [handleSwipeToNext]
  );

  return (
    <View className="flex-1 bg-white">
      <View
        style={[
          styles.headerShell,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.tabRow}>
          <View style={styles.tabLeft}>
            <ProfileAvatar
              photoURL={photoURL}
              fallbackLetter={initial}
              size={DUEL_ROUND_AVATAR_SIZE}
            />
            <Text style={styles.displayName} numberOfLines={1}>
              {displayName}
            </Text>
          </View>

          <View style={styles.tabRight}>
            <DuelDigitalCountdown
              secondsLeft={secondsLeft}
              ringSize={DUEL_ROUND_COUNTDOWN_SIZE}
            />
          </View>
        </View>

        <View pointerEvents="box-none" style={styles.scorePillBridge}>
          <DuelAlarmScorePill netScore={sessionNet} variant="round" />
        </View>
      </View>

      <GestureDetector gesture={swipeGesture}>
        <View
          style={[
            styles.glowContent,
            {
              paddingHorizontal: DUEL_ROUND_GLOW_HORIZONTAL_PADDING,
              paddingTop: DUEL_ROUND_GLOW_TOP_PADDING,
              paddingBottom: DUEL_ROUND_GLOW_BOTTOM_PADDING + insets.bottom,
            },
          ]}
        >
          <View style={styles.frameWrap}>
            {imageUri ? (
              <DuelFramedGlow
                uri={imageUri}
                recyclingKey={`duel-${post.id}`}
                animate={votingEnabled}
                borderRadius={DUEL_ROUND_GLOW_BORDER_RADIUS}
              />
            ) : (
              <View
                className="flex-1 border border-gray-200 bg-neutral-200"
                style={{ borderRadius: DUEL_ROUND_GLOW_BORDER_RADIUS }}
              />
            )}
          </View>
        </View>
      </GestureDetector>

      <View
        pointerEvents="box-none"
        style={[
          styles.voteOverlay,
          {
            bottom: voteOverlayBottom,
            gap: voteLayout.voteGap,
          },
        ]}
      >
        <ProfileVoteCircleButton
          direction="down"
          onPress={onDown}
          disabled={!votingEnabled}
          diameter={voteLayout.voteDiameter}
          showLabel
          accessibilityLabel="Alçalt, gönderi puanından 1 düşür"
        />
        <ProfileVoteCircleButton
          direction="up"
          onPress={onUp}
          disabled={!votingEnabled}
          diameter={voteLayout.voteDiameter}
          showLabel
          accessibilityLabel="Yükselt, gönderi puanına 1 ekle"
        />
      </View>
    </View>
  );
}

export const DuelFullScreenRound = memo(DuelFullScreenRoundInner);

/** @deprecated Use DuelFullScreenRound */
export const DuelParticipantPanel = DuelFullScreenRound;

const styles = StyleSheet.create({
  headerShell: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    zIndex: 5,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabRow: {
    height: DUEL_ROUND_TAB_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: DUEL_ROUND_TAB_HORIZONTAL_PADDING,
  },
  tabLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    minWidth: 0,
    paddingRight: 12,
    gap: 10,
  },
  displayName: {
    flex: 1,
    fontSize: DUEL_ROUND_NAME_FONT_SIZE,
    lineHeight: Math.round(DUEL_ROUND_NAME_FONT_SIZE * 1.25),
    fontWeight: "600",
    color: "#111827",
  },
  tabRight: {
    flexShrink: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  scorePillBridge: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -DUEL_ROUND_SCORE_PILL_OVERLAP,
    alignItems: "center",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#111827",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  glowContent: {
    minHeight: 0,
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  frameWrap: {
    flex: 1,
    position: "relative",
    minHeight: 0,
    overflow: "hidden",
  },
  voteOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 30,
  },
});

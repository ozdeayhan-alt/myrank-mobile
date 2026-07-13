import { memo, useEffect, useRef } from "react";
import { Text } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { profileVoteDisplayKey } from "@/features/ranking/vote/voteDisplayStore";
import { useVoteDisplay } from "@/features/ranking/vote/useVoteDisplay";
import type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";
import type { VoteFlashDirection } from "./ProfileVoteProvider";
import { formatGaugeScoreLabel } from "./profileTotalScoreGaugeGeometry";

const EASE_OUT = Easing.out(Easing.cubic);

function scoreTextClass(
  voteFlash: VoteFlashDirection,
  gaugeVoteMode: GaugeVoteMode
): string {
  if (voteFlash === "up") return "text-blue-600";
  if (voteFlash === "down") return "text-red-600";
  if (gaugeVoteMode === "up") return "text-blue-600";
  if (gaugeVoteMode === "down") return "text-red-600";
  return "text-gray-900";
}

type ProfileVoteScoreLabelProps = {
  userId: string;
  initialTotalScore: number;
  voteFlash?: VoteFlashDirection;
  gaugeVoteMode?: GaugeVoteMode;
  fontSize: number;
  lineHeight: number;
};

function ProfileVoteScoreLabelInner({
  userId,
  initialTotalScore,
  voteFlash = null,
  gaugeVoteMode = null,
  fontSize,
  lineHeight,
}: ProfileVoteScoreLabelProps) {
  const displayKey = profileVoteDisplayKey(userId);
  const score = useVoteDisplay(displayKey, initialTotalScore);
  const scoreScale = useSharedValue(1);
  const prevScoreRef = useRef(score);

  useEffect(() => {
    const delta = score - prevScoreRef.current;
    if (Math.abs(delta) === 1) {
      scoreScale.value =
        delta > 0
          ? withSequence(
              withTiming(1.03, { duration: 120, easing: EASE_OUT }),
              withTiming(1, { duration: 180, easing: EASE_OUT })
            )
          : withSequence(
              withTiming(0.97, { duration: 120, easing: EASE_OUT }),
              withTiming(1, { duration: 180, easing: EASE_OUT })
            );
    }
    prevScoreRef.current = score;
  }, [score, scoreScale]);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  return (
    <Animated.View style={scoreAnimatedStyle}>
      <Text
        className={`text-center font-bold tabular-nums ${scoreTextClass(voteFlash, gaugeVoteMode)}`}
        style={{ fontSize, lineHeight }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formatGaugeScoreLabel(score)}
      </Text>
    </Animated.View>
  );
}

export const ProfileVoteScoreLabel = memo(ProfileVoteScoreLabelInner);

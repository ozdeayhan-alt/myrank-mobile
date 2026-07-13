import { useEffect, useMemo, useRef } from "react";
import { Platform, StyleSheet, Text } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  DUEL_ROUND_PILL_BORDER_RADIUS,
  DUEL_ROUND_PILL_LABEL_FONT_SIZE,
  DUEL_ROUND_PILL_MIN_HEIGHT,
  DUEL_ROUND_PILL_MIN_WIDTH,
  DUEL_ROUND_PILL_SCORE_FONT_SIZE,
} from "../lib/duelRoundLayout";

const EASE_OUT = Easing.out(Easing.cubic);
const UP_COLOR = "#2563EB";
const DOWN_COLOR = "#DC2626";
const NEUTRAL_BORDER = "#E5E7EB";
const NEUTRAL_BG = "#F9FAFB";

type DuelAlarmScorePillProps = {
  netScore: number;
  variant?: "default" | "round";
};

export function DuelAlarmScorePill({
  netScore,
  variant = "default",
}: DuelAlarmScorePillProps) {
  const prevNet = useRef(netScore);
  const scale = useSharedValue(1);
  const tension = useSharedValue(0);
  const direction = useSharedValue(0);

  const layout = useMemo(() => {
    if (variant === "round") {
      return {
        minHeight: DUEL_ROUND_PILL_MIN_HEIGHT,
        minWidth: DUEL_ROUND_PILL_MIN_WIDTH,
        borderRadius: DUEL_ROUND_PILL_BORDER_RADIUS,
        paddingHorizontal: 12,
        paddingVertical: 5,
        labelFontSize: DUEL_ROUND_PILL_LABEL_FONT_SIZE,
        labelLineHeight: 13,
        scoreFontSize: DUEL_ROUND_PILL_SCORE_FONT_SIZE,
        scoreLineHeight: 28,
      };
    }

    return {
      minHeight: 44,
      minWidth: 52,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      labelFontSize: 10,
      labelLineHeight: 12,
      scoreFontSize: 20,
      scoreLineHeight: 24,
    };
  }, [variant]);

  useEffect(() => {
    const delta = netScore - prevNet.current;
    if (delta === 0) {
      return;
    }

    direction.value = delta > 0 ? 1 : -1;
    tension.value = 0;
    tension.value = withSequence(
      withTiming(1, { duration: 90, easing: EASE_OUT }),
      withTiming(0, { duration: 160, easing: EASE_OUT })
    );
    scale.value = withSequence(
      withTiming(1.08, { duration: 90, easing: EASE_OUT }),
      withTiming(0.98, { duration: 60, easing: EASE_OUT }),
      withTiming(1, { duration: 80, easing: EASE_OUT })
    );
    prevNet.current = netScore;
  }, [direction, netScore, scale, tension]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: interpolateColor(
      tension.value,
      [0, 1],
      [
        NEUTRAL_BORDER,
        direction.value > 0 ? UP_COLOR : direction.value < 0 ? DOWN_COLOR : NEUTRAL_BORDER,
      ]
    ),
    backgroundColor: interpolateColor(
      tension.value,
      [0, 1],
      [
        NEUTRAL_BG,
        direction.value > 0 ? "#EFF6FF" : direction.value < 0 ? "#FEF2F2" : NEUTRAL_BG,
      ]
    ),
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      tension.value,
      [0, 1],
      [
        "#111827",
        direction.value > 0 ? UP_COLOR : direction.value < 0 ? DOWN_COLOR : "#111827",
      ]
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.pill,
        {
          minHeight: layout.minHeight,
          minWidth: layout.minWidth,
          borderRadius: layout.borderRadius,
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.paddingVertical,
        },
        Platform.OS === "ios" ? styles.pillShadow : null,
        pillStyle,
      ]}
      accessibilityLabel={`Puan ${netScore}`}
    >
      <Text
        style={[
          styles.label,
          {
            fontSize: layout.labelFontSize,
            lineHeight: layout.labelLineHeight,
          },
        ]}
      >
        Puan
      </Text>
      <Animated.Text
        style={[
          styles.score,
          {
            fontSize: layout.scoreFontSize,
            lineHeight: layout.scoreLineHeight,
          },
          scoreStyle,
        ]}
        className="tabular-nums"
      >
        {netScore}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: NEUTRAL_BG,
  },
  pillShadow: {
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  label: {
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.3,
  },
  score: {
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});

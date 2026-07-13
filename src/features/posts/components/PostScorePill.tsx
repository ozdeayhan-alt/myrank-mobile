import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  FERRARI_RED,
  VOTE_UP_BLUE,
} from "@/features/profile/components/profileFollowButtonTheme";
import { FEED_HEADER_BLOCK_HEIGHT } from "./postFeedHeaderLayout";

const EASE_OUT = Easing.out(Easing.cubic);
const FLASH_MS = 420;

type ScoreFlash = "up" | "down" | null;

type PostScorePillProps = {
  score: number;
};

export function PostScorePill({ score }: PostScorePillProps) {
  const prevScore = useRef(score);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flash, setFlash] = useState<ScoreFlash>(null);
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    const previous = prevScore.current;
    if (score === previous) {
      return;
    }

    const direction: ScoreFlash = score > previous ? "up" : "down";
    setFlash(direction);

    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
    }
    flashTimerRef.current = setTimeout(() => {
      flashTimerRef.current = null;
      setFlash(null);
    }, FLASH_MS);

    if (direction === "up") {
      scale.value = withSequence(
        withTiming(1.08, { duration: 120, easing: EASE_OUT }),
        withTiming(1, { duration: 180, easing: EASE_OUT })
      );
    } else {
      scale.value = withSequence(
        withTiming(0.94, { duration: 120, easing: EASE_OUT }),
        withTiming(1, { duration: 180, easing: EASE_OUT })
      );
    }

    pulseOpacity.value = withSequence(
      withTiming(0.86, { duration: 80 }),
      withTiming(1, { duration: 200 })
    );

    prevScore.current = score;
  }, [pulseOpacity, scale, score]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: pulseOpacity.value,
  }));

  const flashColors =
    flash === "up"
      ? {
          backgroundColor: "rgba(8,102,255,0.14)",
          borderColor: VOTE_UP_BLUE,
          labelColor: VOTE_UP_BLUE,
          scoreColor: VOTE_UP_BLUE,
        }
      : flash === "down"
        ? {
            backgroundColor: "rgba(255,40,0,0.12)",
            borderColor: FERRARI_RED,
            labelColor: FERRARI_RED,
            scoreColor: FERRARI_RED,
          }
        : {
            backgroundColor: "#F9FAFB",
            borderColor: "#E5E7EB",
            labelColor: "#9CA3AF",
            scoreColor: "#111827",
          };

  const containerStyle: ViewStyle[] = [
    styles.pill,
    {
      backgroundColor: flashColors.backgroundColor,
      borderColor: flashColors.borderColor,
    },
    Platform.OS === "ios" ? styles.pillShadow : null,
    pillStyle,
  ].filter(Boolean) as ViewStyle[];

  return (
    <Animated.View
      style={containerStyle}
      accessibilityLabel={`Gönderi puanı ${score}`}
    >
      <Text
        style={[styles.label, { color: flashColors.labelColor }]}
      >
        Puan
      </Text>
      <Text
        style={[styles.score, { color: flashColors.scoreColor }]}
      >
        {score}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: FEED_HEADER_BLOCK_HEIGHT,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    lineHeight: 12,
  },
  score: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  pillShadow: {
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
});

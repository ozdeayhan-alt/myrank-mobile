import { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type PostScorePillProps = {
  score: number;
  variant?: "feed" | "reels";
};

export function PostScorePill({ score, variant = "feed" }: PostScorePillProps) {
  const prevScore = useRef(score);
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);
  const isReels = variant === "reels";

  useEffect(() => {
    if (score > prevScore.current) {
      scale.value = withSequence(
        withTiming(1.06, { duration: 120 }),
        withTiming(1, { duration: 130 })
      );
      pulseOpacity.value = withSequence(
        withTiming(isReels ? 0.75 : 0.88, { duration: 80 }),
        withTiming(1, { duration: 170 })
      );
    }
    prevScore.current = score;
  }, [isReels, pulseOpacity, scale, score]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: pulseOpacity.value,
  }));

  const containerStyle: ViewStyle[] = [
    isReels ? styles.reelsPill : styles.pill,
    !isReels && Platform.OS === "ios" ? styles.pillShadow : null,
    pillStyle,
  ].filter(Boolean) as ViewStyle[];

  return (
    <Animated.View
      style={containerStyle}
      accessibilityLabel={`Gönderi puanı ${score}`}
    >
      <Text
        className={
          isReels
            ? "text-[9px] font-medium leading-3 text-white/55"
            : "text-[10px] font-medium leading-3 text-gray-400"
        }
      >
        Puan
      </Text>
      <Text
        className={
          isReels
            ? "text-sm font-semibold leading-4 text-white/90"
            : "text-base font-semibold leading-5 text-gray-900"
        }
      >
        {score}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 36,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  reelsPill: {
    minHeight: 32,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.38)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    opacity: 0.48,
  },
  pillShadow: {
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
});

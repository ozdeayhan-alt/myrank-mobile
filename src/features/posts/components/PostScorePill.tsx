import { useEffect, useRef } from "react";
import { Platform, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type PostScorePillProps = {
  score: number;
};

export function PostScorePill({ score }: PostScorePillProps) {
  const prevScore = useRef(score);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (score > prevScore.current) {
      scale.value = withSequence(
        withTiming(1.04, { duration: 120 }),
        withTiming(1, { duration: 130 })
      );
      opacity.value = withSequence(
        withTiming(0.88, { duration: 80 }),
        withTiming(1, { duration: 170 })
      );
    }
    prevScore.current = score;
  }, [opacity, scale, score]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.pill, Platform.OS === "ios" ? styles.pillShadow : null, pillStyle]}
      accessibilityLabel={`Gönderi puanı ${score}`}
    >
      <Text className="text-[10px] font-medium leading-3 text-gray-400">Puan</Text>
      <Text className="text-base font-semibold leading-5 text-gray-900">{score}</Text>
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
  pillShadow: {
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
});

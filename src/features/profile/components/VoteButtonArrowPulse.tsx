import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { VoteChevronIcon } from "./VoteChevronIcon";

const UP_COLORS = {
  fill: "rgba(37,99,235,0.55)",
  rim: "rgba(29,78,216,0.7)",
};
const DOWN_COLORS = {
  fill: "rgba(220,38,38,0.48)",
  rim: "rgba(185,28,28,0.62)",
};

type VoteButtonArrowPulseProps = {
  direction: "up" | "down";
  pulseKey: number;
};

export function VoteButtonArrowPulse({
  direction,
  pulseKey,
}: VoteButtonArrowPulseProps) {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  const colors = direction === "up" ? UP_COLORS : DOWN_COLORS;
  const size = 34;

  useEffect(() => {
    if (pulseKey === 0) {
      return;
    }
    scale.value = 0.55;
    opacity.value = 0.68;
    scale.value = withTiming(1, { duration: 110 });
    opacity.value = withDelay(70, withTiming(0, { duration: 100 }));
  }, [opacity, pulseKey, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, animatedStyle]}
    >
      <View
        style={[
          styles.face,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.fill,
            borderColor: colors.rim,
          },
        ]}
      >
        <VoteChevronIcon direction={direction} size={20} color="#ffffff" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 20,
  },
  face: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
});

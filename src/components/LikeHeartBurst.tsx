import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { FERRARI_RED, VOTE_UP_BLUE } from "@/features/profile/components/profileFollowButtonTheme";

export type VoteBurstDirection = "heart" | "up" | "down";

type LikeHeartBurstProps = {
  burstKey: number;
  direction?: VoteBurstDirection;
  style?: StyleProp<ViewStyle>;
};

const ARROW_SIZE = 64;

export function LikeHeartBurst({
  burstKey,
  direction = "heart",
  style,
}: LikeHeartBurstProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (burstKey === 0) {
      return;
    }
    scale.value = 0.3;
    opacity.value = 0.68;
    scale.value = withSequence(
      withSpring(1.1, { damping: 12, stiffness: 200 }),
      withSpring(1, { damping: 14 })
    );
    opacity.value = withDelay(550, withTiming(0, { duration: 280 }));
  }, [burstKey, opacity, scale]);

  const burstStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrap, style, burstStyle]}
    >
      {direction === "up" ? (
        <Ionicons
          name="arrow-up"
          size={ARROW_SIZE}
          color={VOTE_UP_BLUE}
          style={styles.arrowShadow}
        />
      ) : direction === "down" ? (
        <Ionicons
          name="arrow-down"
          size={ARROW_SIZE}
          color={FERRARI_RED}
          style={styles.arrowShadow}
        />
      ) : (
        <Text style={styles.heart}>❤️</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  heart: {
    fontSize: 58,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  arrowShadow: {
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});

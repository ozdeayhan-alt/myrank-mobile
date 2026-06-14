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

type LikeHeartBurstProps = {
  burstKey: number;
  style?: StyleProp<ViewStyle>;
};

export function LikeHeartBurst({ burstKey, style }: LikeHeartBurstProps) {
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

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.heartWrap, style, heartStyle]}
    >
      <Text style={styles.heart}>❤️</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heartWrap: {
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
});

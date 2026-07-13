import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { DuelFramedGlow } from "@/features/media/components/DuelFramedGlow";

type DuelWinnerGlowFrameProps = {
  uri: string;
  recyclingKey: string;
};

function DuelWinnerGlowFrameInner({
  uri,
  recyclingKey,
}: DuelWinnerGlowFrameProps) {
  const glow = useSharedValue(0.55);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.55, { duration: 900, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [glow]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.98 + glow.value * 0.02 }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />
      <View style={styles.inner}>
        <DuelFramedGlow uri={uri} recyclingKey={recyclingKey} />
      </View>
    </View>
  );
}

export const DuelWinnerGlowFrame = memo(DuelWinnerGlowFrameInner);

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    position: "relative",
    minHeight: 0,
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#F59E0B",
    backgroundColor: "rgba(245,158,11,0.08)",
    zIndex: 2,
  },
  inner: {
    flex: 1,
    margin: 4,
    minHeight: 0,
  },
});

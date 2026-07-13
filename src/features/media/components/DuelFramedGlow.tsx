import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { DUEL_DURATION_MS } from "@/features/duel/constants";
import { FeedGlowImage } from "./FeedGlowImage";

const DUEL_GLOW_MAX_SCALE = 1.05;

type DuelFramedGlowProps = {
  uri: string;
  recyclingKey?: string;
  /** Düello turunda çerçeve içinde hafif yavaş büyüme. */
  animate?: boolean;
  borderRadius?: number;
};

/** Duel turu — Glow çerçeve içinde contain (yatay/dikey tam görünür). */
export function DuelFramedGlow({
  uri,
  recyclingKey = "duel-framed",
  animate = false,
  borderRadius = 16,
}: DuelFramedGlowProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = 1;
    if (!animate) {
      return;
    }
    scale.value = withTiming(DUEL_GLOW_MAX_SCALE, {
      duration: DUEL_DURATION_MS,
      easing: Easing.linear,
    });
    return () => {
      cancelAnimation(scale);
    };
  }, [animate, recyclingKey, scale, uri]);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.frame, { borderRadius }]}>
      <Animated.View style={[StyleSheet.absoluteFillObject, imageStyle]}>
        <FeedGlowImage uri={uri} recyclingKey={recyclingKey} priority="high" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#111827",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { VoteChevronIcon } from "./VoteChevronIcon";
import type { VoteArrowParticle } from "./profileVoteArrowFountain";

const STREAM_DURATION_MS = 550;

const UP_COLORS = {
  fill: "rgba(37,99,235,0.58)",
  rim: "rgba(29,78,216,0.72)",
  shadow: "rgba(37,99,235,0.35)",
};
const DOWN_COLORS = {
  fill: "rgba(220,38,38,0.52)",
  rim: "rgba(185,28,28,0.68)",
  shadow: "rgba(220,38,38,0.3)",
};

type VoteArrowParticleViewProps = {
  particle: VoteArrowParticle;
  onComplete: (id: string) => void;
};

export function VoteArrowParticleView({
  particle,
  onComplete,
}: VoteArrowParticleViewProps) {
  const isUp = particle.direction === "up";
  const colors = isUp ? UP_COLORS : DOWN_COLORS;
  const peakOpacity = isUp ? 0.68 : 0.62;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      particle.delay,
      withTiming(
        1,
        { duration: STREAM_DURATION_MS, easing: Easing.out(Easing.quad) },
        (finished) => {
          if (finished) {
            runOnJS(onComplete)(particle.id);
          }
        }
      )
    );
  }, [onComplete, particle.delay, particle.id, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const curve = Math.sin(t * Math.PI);
    const fadeIn = t < 0.12 ? t / 0.12 : 1;
    const fadeOut = t > 0.55 ? Math.max(0, 1 - (t - 0.55) / 0.45) : 1;

    return {
      opacity: fadeIn * fadeOut * peakOpacity,
      transform: [
        {
          translateX: particle.travelX * t + particle.curveBias * curve,
        },
        { translateY: particle.travelY * t },
        { scale: 0.52 + t * 0.38 },
      ],
    };
  });

  const faceSize = particle.size + 10;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: particle.x - faceSize / 2,
          top: particle.y - faceSize / 2,
          width: faceSize,
          height: faceSize,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.face,
          {
            width: faceSize,
            height: faceSize,
            borderRadius: faceSize / 2,
            backgroundColor: colors.fill,
            borderColor: colors.rim,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <VoteChevronIcon
          direction={particle.direction}
          size={Math.round(particle.size * 0.6)}
          color="#ffffff"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 26,
    elevation: Platform.OS === "android" ? 26 : 0,
  },
  face: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
});

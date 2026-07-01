import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { PODIUM_FRAME, type PrestigeTier } from "../utils/prestige";

const OUTER_RADIUS = 18;

type RankingPodiumFrameProps = {
  tier: PrestigeTier;
  rank: number;
  children: ReactNode;
};

function podiumEntering(rank: number) {
  return FadeInUp.duration(220)
    .delay((rank - 1) * 50)
    .springify()
    .damping(18);
}

function RankingPodiumFrameInner({
  tier,
  rank,
  children,
}: RankingPodiumFrameProps) {
  const frame = PODIUM_FRAME[tier];
  const innerRadius = OUTER_RADIUS - frame.borderWidth;
  const glowPulse = useSharedValue(1);

  useEffect(() => {
    if (rank !== 1) {
      return;
    }

    glowPulse.value = withRepeat(
      withSequence(
        withTiming(0.72, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(glowPulse);
    };
  }, [rank, glowPulse]);

  const shadowAnimatedStyle = useAnimatedStyle(() => {
    if (rank !== 1 || Platform.OS !== "ios") {
      return {};
    }

    return {
      shadowOpacity: frame.shadowOpacity * glowPulse.value,
    };
  });

  return (
    <Animated.View
      entering={podiumEntering(rank)}
      style={[
        styles.wrapper,
        styles.shadow,
        {
          marginBottom: frame.marginBottom,
          shadowColor: frame.shadowColor,
          shadowOpacity: frame.shadowOpacity,
        },
        shadowAnimatedStyle,
      ]}
    >
      <LinearGradient
        colors={[...frame.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            borderRadius: OUTER_RADIUS,
            padding: frame.borderWidth,
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              borderRadius: innerRadius,
              backgroundColor: frame.tint,
            },
          ]}
        >
          {children}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export const RankingPodiumFrame = memo(RankingPodiumFrameInner);

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
  },
  shadow: {
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    ...Platform.select({
      android: { elevation: 4 },
      default: {},
    }),
  },
  gradient: {
    overflow: "hidden",
  },
  inner: {
    overflow: "hidden",
  },
});

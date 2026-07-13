import { memo, useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { DUEL_DURATION_MS } from "../constants";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DEFAULT_RING_SIZE = 50;
const TOTAL_SECONDS = DUEL_DURATION_MS / 1000;

const TRACK_COLOR = "#E5E7EB";
const PROGRESS_COLOR = "#2563EB";
const URGENT_PROGRESS = "#F97316";
const URGENT_DIGIT = "#EA580C";

type DuelDigitalCountdownProps = {
  secondsLeft: number;
  ringSize?: number;
};

function DuelDigitalCountdownInner({
  secondsLeft,
  ringSize = DEFAULT_RING_SIZE,
}: DuelDigitalCountdownProps) {
  const urgent = secondsLeft <= 3 && secondsLeft > 0;
  const progress = useSharedValue(Math.max(0, secondsLeft) / TOTAL_SECONDS);
  const pulse = useSharedValue(1);

  const ringMetrics = useMemo(() => {
    const strokeWidth = Math.max(3, ringSize * 0.07);
    const radius = (ringSize - strokeWidth) / 2;
    const center = ringSize / 2;
    const circumference = 2 * Math.PI * radius;
    const digitFontSize = Math.round(ringSize * 0.34);
    const digitLineHeight = Math.round(digitFontSize * 1.18);

    return {
      strokeWidth,
      radius,
      center,
      circumference,
      digitFontSize,
      digitLineHeight,
    };
  }, [ringSize]);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, secondsLeft) / TOTAL_SECONDS, {
      duration: 950,
      easing: Easing.linear,
    });
  }, [progress, secondsLeft]);

  useEffect(() => {
    if (!urgent) {
      pulse.value = withTiming(1, { duration: 120 });
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 220, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 220, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );
  }, [pulse, urgent]);

  const ringAnimatedProps = useAnimatedProps(() => ({
    strokeDashoffset: ringMetrics.circumference * (1 - progress.value),
  }));

  const digitStyle = useAnimatedStyle(() => ({
    opacity: urgent ? pulse.value : 1,
  }));

  const display = String(Math.max(0, secondsLeft)).padStart(2, "0");
  const progressColor = urgent ? URGENT_PROGRESS : PROGRESS_COLOR;

  return (
    <View
      style={[styles.wrapper, { width: ringSize, height: ringSize }]}
      accessibilityLabel={`Kalan süre ${secondsLeft} saniye`}
    >
      <Svg width={ringSize} height={ringSize}>
        <Circle
          cx={ringMetrics.center}
          cy={ringMetrics.center}
          r={ringMetrics.radius}
          stroke={TRACK_COLOR}
          strokeWidth={ringMetrics.strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={ringMetrics.center}
          cy={ringMetrics.center}
          r={ringMetrics.radius}
          stroke={progressColor}
          strokeWidth={ringMetrics.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${ringMetrics.circumference} ${ringMetrics.circumference}`}
          animatedProps={ringAnimatedProps}
          transform={`rotate(-90 ${ringMetrics.center} ${ringMetrics.center})`}
        />
      </Svg>
      <Animated.Text
        style={[
          styles.digits,
          {
            fontSize: ringMetrics.digitFontSize,
            lineHeight: ringMetrics.digitLineHeight,
          },
          urgent ? styles.digitsUrgent : null,
          digitStyle,
        ]}
        className="tabular-nums"
      >
        {display}
      </Animated.Text>
    </View>
  );
}

export const DuelDigitalCountdown = memo(DuelDigitalCountdownInner);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  digits: {
    position: "absolute",
    fontWeight: "700",
    color: "#111827",
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.3,
  },
  digitsUrgent: {
    color: URGENT_DIGIT,
  },
});

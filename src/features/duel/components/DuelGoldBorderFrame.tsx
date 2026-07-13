import { memo, useEffect, useId, useState, type ReactNode } from "react";
import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  View,
  type LayoutRectangle,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { FERRARI_RED, VOTE_UP_BLUE } from "@/features/profile/components/profileFollowButtonTheme";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const BORDER_WIDTH = 3;
const BORDER_RADIUS = 16;
const CHASE_DURATION_MS = 3800;

const BORDER_GRADIENT_STOPS = [
  { offset: "0%", color: "#6B4F0A" },
  { offset: "14%", color: "#FFD54F" },
  { offset: "28%", color: VOTE_UP_BLUE },
  { offset: "42%", color: "#FFF8DC" },
  { offset: "56%", color: FERRARI_RED },
  { offset: "70%", color: "#FFD54F" },
  { offset: "84%", color: "#C9A227" },
  { offset: "100%", color: "#6B4F0A" },
] as const;

type DuelGoldBorderFrameProps = {
  children: ReactNode;
  animate?: boolean;
  testID?: string;
};

function estimateRoundedRectPerimeter(
  width: number,
  height: number,
  radius: number
): number {
  const r = Math.min(radius, width / 2, height / 2);
  return 2 * (width + height - 2 * r) + 2 * Math.PI * r;
}

function DuelGoldBorderFrameInner({
  children,
  animate = false,
  testID,
}: DuelGoldBorderFrameProps) {
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);
  const dashOffset = useSharedValue(0);
  const gradientId = `duel-feed-border-${useId().replace(/:/g, "")}`;

  const perimeter =
    layout == null
      ? 0
      : estimateRoundedRectPerimeter(layout.width, layout.height, BORDER_RADIUS);
  const chaseSegment = perimeter > 0 ? perimeter * 0.34 : 0;
  const chaseGap = perimeter > 0 ? perimeter - chaseSegment : 0;

  useEffect(() => {
    if (!animate || perimeter <= 0) {
      cancelAnimation(dashOffset);
      dashOffset.value = 0;
      return;
    }

    dashOffset.value = 0;
    dashOffset.value = withRepeat(
      withTiming(perimeter, {
        duration: CHASE_DURATION_MS,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => {
      cancelAnimation(dashOffset);
    };
  }, [animate, dashOffset, perimeter]);

  const animatedStrokeProps = useAnimatedProps(() => ({
    strokeDashoffset: -dashOffset.value,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout;
    setLayout((current) => {
      if (
        current &&
        Math.round(current.width) === Math.round(next.width) &&
        Math.round(current.height) === Math.round(next.height)
      ) {
        return current;
      }
      return next;
    });
  };

  const halfStroke = BORDER_WIDTH / 2;

  return (
    <View
      className="mb-5"
      onLayout={handleLayout}
      style={[
        styles.outer,
        Platform.OS === "android" ? { elevation: 3 } : undefined,
        Platform.OS === "ios"
          ? {
              shadowColor: "#C9A227",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }
          : undefined,
      ]}
      testID={testID}
    >
      {layout != null && perimeter > 0 ? (
        <Svg
          pointerEvents="none"
          width={layout.width}
          height={layout.height}
          style={StyleSheet.absoluteFillObject}
        >
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              {BORDER_GRADIENT_STOPS.map((stop) => (
                <Stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
              ))}
            </LinearGradient>
          </Defs>
          <AnimatedRect
            x={halfStroke}
            y={halfStroke}
            width={Math.max(0, layout.width - BORDER_WIDTH)}
            height={Math.max(0, layout.height - BORDER_WIDTH)}
            rx={BORDER_RADIUS}
            ry={BORDER_RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={BORDER_WIDTH}
            strokeLinecap="round"
            strokeDasharray={`${chaseSegment} ${chaseGap}`}
            animatedProps={animatedStrokeProps}
          />
        </Svg>
      ) : null}

      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: BORDER_RADIUS + 1,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  inner: {
    margin: BORDER_WIDTH,
    borderRadius: BORDER_RADIUS,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
});

export const DuelGoldBorderFrame = memo(DuelGoldBorderFrameInner);

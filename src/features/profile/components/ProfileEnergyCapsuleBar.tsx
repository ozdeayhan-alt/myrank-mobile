import { memo, useEffect } from "react";
import { Platform, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";
import { getFireBarTheme, isFlamingMode } from "./profileFlameTheme";

const TEAL = "#4a7c82";
const GOLD = "#d4af37";
const TRACK_COLOR = "#edf1f3";
const TRACK_EDGE = "#dfe5ea";

type ProfileEnergyCapsuleBarProps = {
  gaugeWidth: number;
  gaugeHeight: number;
  barX: number;
  barY: number;
  barLength: number;
  pillHeight: number;
  fillProgress: number;
  gaugeVoteMode: GaugeVoteMode;
};

function ProfileEnergyCapsuleBarInner({
  gaugeWidth,
  gaugeHeight,
  barX,
  barY,
  barLength,
  pillHeight,
  fillProgress,
  gaugeVoteMode,
}: ProfileEnergyCapsuleBarProps) {
  const flaming = isFlamingMode(gaugeVoteMode);
  const fireTheme = getFireBarTheme(gaugeVoteMode);
  const flicker = useSharedValue(0.7);
  const pillTop = barY - pillHeight / 2;
  const fillWidth = Math.max(pillHeight, fillProgress * barLength);

  useEffect(() => {
    if (!flaming) {
      cancelAnimation(flicker);
      flicker.value = 0.7;
      return;
    }

    flicker.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: 900 }),
        withTiming(0.95, { duration: 900 })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(flicker);
    };
  }, [flaming, flicker]);

  const glowStyle = useAnimatedStyle(() => {
    if (!flaming) {
      return { opacity: 0, transform: [{ scale: 1 }] };
    }
    return {
      opacity: 0.22 + flicker.value * 0.2,
      transform: [{ scale: 1 }],
    };
  });

  const barStyle = useAnimatedStyle(() => {
    if (!flaming) {
      return { opacity: 1 };
    }
    return {
      opacity: 0.9 + flicker.value * 0.08,
    };
  });

  const fillPaint =
    flaming && fireTheme
      ? `url(#${fireTheme.fillGradientId})`
      : "url(#gaugeNeutralFill)";

  return (
    <View
      style={{
        width: gaugeWidth,
        height: gaugeHeight + 8,
        overflow: "visible",
      }}
    >
      {flaming && fireTheme ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              left: barX - 4,
              top: pillTop - 5,
              width: barLength + 8,
              height: pillHeight + 10,
              borderRadius: (pillHeight + 10) / 2,
              backgroundColor: `rgba(${fireTheme.glowRgb},0.35)`,
              shadowColor: fireTheme.glow,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: Platform.OS === "android" ? 0 : 0.55,
              shadowRadius: 12,
              elevation: Platform.OS === "android" ? 3 : 0,
            },
            glowStyle,
          ]}
        />
      ) : null}

      <Animated.View style={barStyle}>
        <Svg
          width={gaugeWidth}
          height={gaugeHeight}
          viewBox={`0 0 ${gaugeWidth} ${gaugeHeight}`}
        >
          <Defs>
            <LinearGradient id="gaugeNeutralFill" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={TEAL} />
              <Stop offset="55%" stopColor="#6d9b7a" />
              <Stop offset="100%" stopColor={GOLD} />
            </LinearGradient>
            <LinearGradient id="gaugeFireBlue" x1="0%" y1="100%" x2="0%" y2="0%">
              <Stop offset="0%" stopColor="#1e3a8a" />
              <Stop offset="45%" stopColor="#2563eb" />
              <Stop offset="78%" stopColor="#60a5fa" />
              <Stop offset="100%" stopColor="#bfdbfe" />
            </LinearGradient>
            <LinearGradient id="gaugeFireRed" x1="0%" y1="100%" x2="0%" y2="0%">
              <Stop offset="0%" stopColor="#7f1d1d" />
              <Stop offset="45%" stopColor="#dc2626" />
              <Stop offset="78%" stopColor="#f87171" />
              <Stop offset="100%" stopColor="#fecaca" />
            </LinearGradient>
            <LinearGradient id="gaugeSheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          <Rect
            x={barX - 0.5}
            y={pillTop - 0.5}
            width={barLength + 1}
            height={pillHeight + 1}
            rx={(pillHeight + 1) / 2}
            fill={TRACK_EDGE}
            opacity={0.5}
          />
          <Rect
            x={barX}
            y={pillTop}
            width={barLength}
            height={pillHeight}
            rx={pillHeight / 2}
            fill={TRACK_COLOR}
          />
          <Rect
            x={barX}
            y={pillTop}
            width={fillWidth}
            height={pillHeight}
            rx={pillHeight / 2}
            fill={fillPaint}
          />
          <Rect
            x={barX}
            y={pillTop}
            width={fillWidth}
            height={pillHeight / 2}
            rx={pillHeight / 2}
            fill="url(#gaugeSheen)"
            opacity={0.55}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

export const ProfileEnergyCapsuleBar = memo(ProfileEnergyCapsuleBarInner);

import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { PROFILE_METRIC_CARD_MIN_HEIGHT } from "@/components/ProfileMetricCard";
import type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";
import type { VoteFlashDirection } from "./ProfileVoteProvider";
import {
  PROFILE_TOTAL_SCORE_GAUGE_INFO_MESSAGE,
  PROFILE_TOTAL_SCORE_GAUGE_INFO_TITLE,
} from "./profileTotalScoreGaugeInfo";
import {
  computeLadderGaugeProgress,
  describeUpperSemicircleArc,
  formatGaugeScoreLabel,
  formatRankLabel,
  getSemicircleArcLength,
  pointOnUpperSemicircle,
  type GaugeDirection,
  type LadderRung,
} from "./profileTotalScoreGaugeGeometry";

const GAUGE_WIDTH = 140;
const GAUGE_HEIGHT = 84;
const CX = GAUGE_WIDTH / 2;
const CY = GAUGE_HEIGHT - 8;
const RADIUS = 56;
const STROKE = 11;
const TRACK_STROKE = 13;
const ARC_LENGTH = getSemicircleArcLength(RADIUS);

const TRACK_COLOR = "#edf1f3";
const TRACK_EDGE = "#dfe5ea";
const TEAL = "#4a7c82";
const GOLD = "#d4af37";
const BLUE_START = "#93c5fd";
const BLUE_END = "#2563eb";
const RED_START = "#fca5a5";
const RED_END = "#dc2626";

const EASE_OUT = Easing.out(Easing.cubic);
const OPEN_ANIM_MS = 500;
const VOTE_ANIM_MS = 280;
const RUNG_CHANGE_ANIM_MS = 400;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

type ProfileTotalScoreGaugeProps = {
  displayScore: number;
  snapshotScore: number;
  aheadRungs: LadderRung[];
  behindRungs: LadderRung[];
  loadingTarget?: boolean;
  snapshotReady?: boolean;
  voteFlash?: VoteFlashDirection;
  gaugeVoteMode?: GaugeVoteMode;
};

function resolveEffectiveDirection(
  gaugeVoteMode: GaugeVoteMode
): GaugeDirection {
  return gaugeVoteMode === "down" ? "down" : "up";
}

function scoreTextClass(
  voteFlash: VoteFlashDirection,
  gaugeVoteMode: GaugeVoteMode
): string {
  if (voteFlash === "up") return "text-blue-600";
  if (voteFlash === "down") return "text-red-600";
  if (gaugeVoteMode === "up") return "text-blue-600";
  if (gaugeVoteMode === "down") return "text-red-600";
  return "text-gray-900";
}

function ProfileTotalScoreGaugeInner({
  displayScore,
  snapshotScore,
  aheadRungs,
  behindRungs,
  loadingTarget = false,
  snapshotReady = true,
  voteFlash = null,
  gaugeVoteMode = null,
}: ProfileTotalScoreGaugeProps) {
  const effectiveDirection = resolveEffectiveDirection(gaugeVoteMode);
  const isNeutralMode = gaugeVoteMode === null;

  const showGaugeInfo = useCallback(() => {
    Alert.alert(
      PROFILE_TOTAL_SCORE_GAUGE_INFO_TITLE,
      PROFILE_TOTAL_SCORE_GAUGE_INFO_MESSAGE
    );
  }, []);

  const gauge = useMemo(() => {
    if (!snapshotReady) {
      return null;
    }
    return computeLadderGaugeProgress({
      score: displayScore,
      baselineScore: snapshotScore,
      direction: effectiveDirection,
      aheadRungs,
      behindRungs,
    });
  }, [
    snapshotReady,
    displayScore,
    snapshotScore,
    effectiveDirection,
    aheadRungs,
    behindRungs,
  ]);

  const activeRungKey = gauge?.activeRung
    ? `${effectiveDirection}:${gauge.activeRung.rank}:${gauge.activeRung.totalScore}`
    : null;

  const scoreScale = useSharedValue(1);
  const fillProgressRef = useRef(0);
  const remainingFromRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [fillProgress, setFillProgress] = useState(0);
  const [displayedRemaining, setDisplayedRemaining] = useState(0);

  const prevDisplayScoreRef = useRef(displayScore);
  const prevRungKeyRef = useRef(activeRungKey);
  const prevDirectionRef = useRef(effectiveDirection);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!gauge) {
      return;
    }

    const scoreDelta = displayScore - prevDisplayScoreRef.current;
    const isVoteStep = Math.abs(scoreDelta) === 1;
    const rungChanged = prevRungKeyRef.current !== activeRungKey;
    const directionChanged = prevDirectionRef.current !== effectiveDirection;

    if (isVoteStep && scoreDelta > 0) {
      scoreScale.value = withSequence(
        withTiming(1.03, { duration: 120, easing: EASE_OUT }),
        withTiming(1, { duration: 180, easing: EASE_OUT })
      );
    } else if (isVoteStep && scoreDelta < 0) {
      scoreScale.value = withSequence(
        withTiming(0.97, { duration: 120, easing: EASE_OUT }),
        withTiming(1, { duration: 180, easing: EASE_OUT })
      );
    }

    let duration = OPEN_ANIM_MS;
    if (hasOpenedRef.current) {
      if (isVoteStep) {
        duration = VOTE_ANIM_MS;
      } else if (rungChanged || directionChanged) {
        duration = RUNG_CHANGE_ANIM_MS;
      } else {
        duration = 350;
      }
    }

    const from = hasOpenedRef.current ? fillProgressRef.current : 0;
    const to = gauge.progress;
    const toRemaining = gauge.remainingPoints;
    const animateRemaining =
      hasOpenedRef.current && !directionChanged && !rungChanged;
    const fromRemaining = animateRemaining
      ? remainingFromRef.current
      : toRemaining;
    const start = performance.now();

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      const progress = from + (to - from) * eased;
      fillProgressRef.current = progress;
      setFillProgress(progress);
      setDisplayedRemaining(
        animateRemaining
          ? Math.max(0, Math.round(fromRemaining + (toRemaining - fromRemaining) * eased))
          : toRemaining
      );

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        fillProgressRef.current = to;
        setFillProgress(to);
        remainingFromRef.current = toRemaining;
        setDisplayedRemaining(toRemaining);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    prevDisplayScoreRef.current = displayScore;
    prevRungKeyRef.current = activeRungKey;
    prevDirectionRef.current = effectiveDirection;
    hasOpenedRef.current = true;

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    gauge,
    displayScore,
    activeRungKey,
    effectiveDirection,
    scoreScale,
  ]);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const trackPath = describeUpperSemicircleArc(CX, CY, RADIUS, 0, 1);
  const fillDashoffset = ARC_LENGTH * (1 - fillProgress);
  const leftCap = pointOnUpperSemicircle(CX, CY, RADIUS, 0);
  const rightCap = pointOnUpperSemicircle(CX, CY, RADIUS, 1);

  const gradientId =
    gaugeVoteMode === "down"
      ? "scoreGaugeGradientDown"
      : gaugeVoteMode === "up"
        ? "scoreGaugeGradientUp"
        : "scoreGaugeGradientNeutral";

  const neighborLabel =
    effectiveDirection === "down" ? "Arkandaki" : "Önündeki";

  const noNeighbor =
    effectiveDirection === "down" ? gauge?.isLast : gauge?.isLeader;

  const leftDotColor =
    effectiveDirection === "down" && !isNeutralMode ? RED_END : TEAL;
  const rightDotColor =
    effectiveDirection === "up" && !isNeutralMode ? BLUE_END : GOLD;

  return (
    <View
      className="w-full flex-1 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white px-1.5 py-2.5 shadow-sm"
      style={[
        { minHeight: PROFILE_METRIC_CARD_MIN_HEIGHT },
        Platform.OS === "android" ? { elevation: 2 } : undefined,
      ]}
      collapsable={false}
    >
      <View className="mb-1 flex-row items-center justify-center gap-1">
        <Text className="text-center text-xs font-semibold tracking-tight text-gray-600">
          Toplam Puan
        </Text>
        <Pressable
          onPress={showGaugeInfo}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Toplam Puan göstergesi hakkında bilgi"
        >
          <Ionicons name="information-circle-outline" size={14} color="#9ca3af" />
        </Pressable>
      </View>

      <View
        className="relative items-center"
        style={{ width: "100%", maxWidth: GAUGE_WIDTH, height: GAUGE_HEIGHT + 28 }}
      >
        <Svg
          width="100%"
          height={GAUGE_HEIGHT}
          viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <Defs>
            <LinearGradient
              id="scoreGaugeGradientNeutral"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <Stop offset="0%" stopColor={TEAL} />
              <Stop offset="45%" stopColor="#6d9b7a" />
              <Stop offset="100%" stopColor={GOLD} />
            </LinearGradient>
            <LinearGradient
              id="scoreGaugeGradientUp"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <Stop offset="0%" stopColor={BLUE_START} />
              <Stop offset="100%" stopColor={BLUE_END} />
            </LinearGradient>
            <LinearGradient
              id="scoreGaugeGradientDown"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <Stop offset="0%" stopColor={RED_END} />
              <Stop offset="100%" stopColor={RED_START} />
            </LinearGradient>
            <LinearGradient id="scoreGaugeSheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </LinearGradient>
          </Defs>

          <Path
            d={trackPath}
            stroke={TRACK_EDGE}
            strokeWidth={TRACK_STROKE + 2}
            fill="none"
            strokeLinecap="round"
            opacity={0.45}
          />

          <Path
            d={trackPath}
            stroke={TRACK_COLOR}
            strokeWidth={TRACK_STROKE}
            fill="none"
            strokeLinecap="round"
          />

          <Path
            d={trackPath}
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={[ARC_LENGTH, ARC_LENGTH]}
            strokeDashoffset={fillDashoffset}
          />

          <Path
            d={trackPath}
            stroke="url(#scoreGaugeSheen)"
            strokeWidth={STROKE - 3}
            fill="none"
            strokeLinecap="round"
            opacity={0.5}
          />
        </Svg>

        <Animated.View
          className="absolute items-center justify-center"
          style={[{ top: 30, left: 0, right: 0 }, scoreAnimatedStyle]}
        >
          <Text
            className={`text-center text-2xl font-bold leading-7 tabular-nums ${scoreTextClass(voteFlash, gaugeVoteMode)}`}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatGaugeScoreLabel(displayScore)}
          </Text>
        </Animated.View>

        <View
          className="absolute flex-row items-center justify-between"
          style={{
            top: GAUGE_HEIGHT - 10,
            left: leftCap.x - 4,
            width: rightCap.x - leftCap.x + 8,
          }}
        >
          <View
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: leftDotColor, opacity: 0.85 }}
          />
          <View
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: rightDotColor, opacity: 0.9 }}
          />
        </View>

        <View
          className="absolute left-0 right-0 flex-row items-end justify-between px-0.5"
          style={{ top: GAUGE_HEIGHT + 2 }}
        >
          <View className="max-w-[48%] items-start">
            <Text
              className="text-[8px] font-semibold uppercase tracking-wide text-gray-400"
              numberOfLines={1}
            >
              Kalan Puan
            </Text>
            <Text
              className="text-[10px] font-bold tabular-nums text-gray-700"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {!snapshotReady || loadingTarget
                ? "…"
                : noNeighbor
                  ? "0"
                  : formatGaugeScoreLabel(displayedRemaining)}
            </Text>
          </View>

          {loadingTarget || !snapshotReady ? (
            <ActivityIndicator size="small" color="#9ca3af" />
          ) : (
            <View className="max-w-[48%] items-end">
              <Text
                className="text-[8px] font-semibold uppercase tracking-wide text-gray-400"
                numberOfLines={1}
              >
                {neighborLabel}
              </Text>
              <Text
                className="text-[10px] font-bold tabular-nums text-gray-700"
                numberOfLines={1}
              >
                {noNeighbor
                  ? "—"
                  : formatRankLabel(gauge?.neighborRank ?? null)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export const ProfileTotalScoreGauge = memo(ProfileTotalScoreGaugeInner);

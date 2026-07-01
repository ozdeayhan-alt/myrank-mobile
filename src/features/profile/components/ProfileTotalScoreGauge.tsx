import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
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
import { PROFILE_METRIC_CARD_MIN_HEIGHT } from "@/components/ProfileMetricCard";
import type { ProfileSegmentGaugeLayout } from "../profileLayout";
import type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";
import { ProfileEnergyCapsuleBar } from "./ProfileEnergyCapsuleBar";
import type { VoteFlashDirection } from "./ProfileVoteProvider";
import {
  PROFILE_TOTAL_SCORE_GAUGE_INFO_MESSAGE,
  PROFILE_TOTAL_SCORE_GAUGE_INFO_TITLE,
} from "./profileTotalScoreGaugeInfo";
import {
  computeLadderGaugeProgress,
  formatGaugeScoreLabel,
  type GaugeDirection,
  type LadderRung,
} from "./profileTotalScoreGaugeGeometry";
import type { ProfileRankingKey } from "../api/fetchProfileRankings";
import type { UserMetadata } from "../types";
import { EMPTY_METADATA } from "../types";
import { formatGaugeTargetLabel } from "../utils/formatGaugeTargetLabel";
import { getGaugeTargetLoadingLabel } from "../utils/getGaugeTargetLoadingLabel";

const EASE_OUT = Easing.out(Easing.cubic);
const OPEN_ANIM_MS = 500;
const VOTE_ANIM_MS = 120;
const RUNG_CHANGE_ANIM_MS = 400;

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

type ProfileTotalScoreGaugeProps = {
  displayScore: number;
  snapshotScore: number;
  aheadRungs: LadderRung[];
  behindRungs: LadderRung[];
  layout: ProfileSegmentGaugeLayout;
  variant?: "card" | "embedded";
  includeMeta?: boolean;
  middleSlot?: ReactNode;
  footerSlot?: ReactNode;
  labelLoading?: boolean;
  pointsLoading?: boolean;
  snapshotReady?: boolean;
  voteFlash?: VoteFlashDirection;
  gaugeVoteMode?: GaugeVoteMode;
  metadata?: UserMetadata;
  labelCategory?: { key: ProfileRankingKey; rank: number } | null;
  /** Kaydırılmış merdiven anchor'ı — hedef basamak seçimi */
  gaugeOfficialRank?: number | null;
  atPinnacle?: boolean;
  atGlobalLast?: boolean;
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
  layout,
  variant = "embedded",
  includeMeta = true,
  middleSlot,
  footerSlot,
  labelLoading = false,
  pointsLoading = false,
  snapshotReady = true,
  voteFlash = null,
  gaugeVoteMode = null,
  metadata = EMPTY_METADATA,
  labelCategory = null,
  gaugeOfficialRank = null,
  atPinnacle = false,
  atGlobalLast = false,
}: ProfileTotalScoreGaugeProps) {
  const {
    gaugeWidth,
    gaugeHeight,
    barX,
    barY,
    barLength,
    barStroke,
    tpFontSize,
    tpLineHeight,
    metaLabelFontSize,
    metaValueFontSize,
    metaTargetFontSize,
    segmentLabelGap,
    stackedMeta,
    gaugeInfoIconSize,
  } = layout;

  const effectiveDirection = resolveEffectiveDirection(gaugeVoteMode);
  const showCard = variant === "card";

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
      officialRank: gaugeOfficialRank ?? labelCategory?.rank ?? null,
    });
  }, [
    snapshotReady,
    displayScore,
    snapshotScore,
    effectiveDirection,
    aheadRungs,
    behindRungs,
    gaugeOfficialRank,
    labelCategory?.rank,
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

  const neighborLabel =
    effectiveDirection === "down" ? "Arkandaki" : "Önündeki";

  const noNeighbor =
    effectiveDirection === "down" ? gauge?.isLast : gauge?.isLeader;

  const showZeroRemaining = atPinnacle || atGlobalLast;

  const targetLabel = useMemo(() => {
    if (atPinnacle) {
      return formatGaugeTargetLabel({
        key: "global",
        metadata,
        targetRank: null,
        direction: effectiveDirection,
        atPinnacle: true,
      });
    }
    if (atGlobalLast) {
      return formatGaugeTargetLabel({
        key: "global",
        metadata,
        targetRank: null,
        direction: effectiveDirection,
        atGlobalLast: true,
      });
    }
    if (!labelCategory || labelLoading) {
      return "";
    }
    const label = formatGaugeTargetLabel({
      key: labelCategory.key,
      metadata,
      targetRank:
        gauge?.activeRung?.rank ??
        (labelCategory.rank > 1 ? labelCategory.rank - 1 : null),
      direction: effectiveDirection,
      noTarget: noNeighbor && !gauge?.activeRung,
    });
    if (label) {
      return label;
    }
    return neighborLabel;
  }, [
    atPinnacle,
    atGlobalLast,
    labelCategory,
    metadata,
    effectiveDirection,
    noNeighbor,
    neighborLabel,
    gauge?.activeRung,
    labelLoading,
  ]);

  const loadingLabel = getGaugeTargetLoadingLabel(gaugeVoteMode);

  const metaRow = includeMeta ? (
    <View
      className={
        stackedMeta ? "items-stretch gap-2" : "flex-row items-start justify-between gap-2"
      }
      style={{ width: gaugeWidth, marginTop: segmentLabelGap }}
    >
      {labelLoading || !snapshotReady ? (
        <View
          className={stackedMeta ? "items-start" : "max-w-[56%] flex-1 items-start"}
        >
          <Text
            className="text-left font-medium leading-snug text-gray-400"
            style={{ fontSize: metaTargetFontSize }}
            numberOfLines={3}
          >
            {loadingLabel}
          </Text>
        </View>
      ) : (
        <View
          className={stackedMeta ? "items-start" : "max-w-[56%] flex-1 items-start"}
        >
          <Text
            className="text-left font-semibold leading-snug text-gray-500"
            style={{ fontSize: metaTargetFontSize }}
            numberOfLines={3}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {targetLabel}
          </Text>
        </View>
      )}

      <View
        className={
          stackedMeta ? "items-end self-end" : "max-w-[42%] items-end"
        }
      >
        <Text
          className="text-right font-semibold uppercase tracking-wide text-gray-400"
          style={{ fontSize: metaLabelFontSize }}
          numberOfLines={1}
        >
          Kalan Puan
        </Text>
        <Text
          className="text-right font-bold tabular-nums text-gray-700"
          style={{ fontSize: metaValueFontSize }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {!snapshotReady || pointsLoading
            ? "…"
            : showZeroRemaining
              ? "0"
              : gauge?.activeRung
                ? formatGaugeScoreLabel(displayedRemaining)
                : noNeighbor
                  ? "…"
                  : formatGaugeScoreLabel(displayedRemaining)}
        </Text>
      </View>
    </View>
  ) : null;

  const energyBar = (
    <View style={{ marginTop: 8 }}>
      <ProfileEnergyCapsuleBar
        gaugeWidth={gaugeWidth}
        gaugeHeight={gaugeHeight}
        barX={barX}
        barY={barY}
        barLength={barLength}
        pillHeight={barStroke}
        fillProgress={fillProgress}
        gaugeVoteMode={gaugeVoteMode}
      />
    </View>
  );

  const gaugeBody = (
    <View className="items-center self-center" style={{ width: gaugeWidth }}>
      {!showCard ? (
        <Pressable
          onPress={showGaugeInfo}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Toplam Puan göstergesi hakkında bilgi"
          style={{ position: "absolute", right: 0, top: 0, zIndex: 2 }}
        >
          <Ionicons
            name="information-circle-outline"
            size={gaugeInfoIconSize}
            color="#9ca3af"
          />
        </Pressable>
      ) : null}

      <Animated.View style={scoreAnimatedStyle}>
        <Text
          className={`text-center font-bold tabular-nums ${scoreTextClass(voteFlash, gaugeVoteMode)}`}
          style={{ fontSize: tpFontSize, lineHeight: tpLineHeight }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatGaugeScoreLabel(displayScore)}
        </Text>
      </Animated.View>

      {middleSlot ? (
        <View className="items-center" style={{ marginTop: 2 }}>
          {middleSlot}
        </View>
      ) : null}

      {energyBar}
      {metaRow}
      {footerSlot ? (
        <View
          className="w-full items-center"
          style={{ marginTop: segmentLabelGap }}
        >
          {footerSlot}
        </View>
      ) : null}
    </View>
  );

  if (!showCard) {
    return gaugeBody;
  }

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
      {gaugeBody}
    </View>
  );
}

export const ProfileTotalScoreGauge = memo(ProfileTotalScoreGaugeInner);

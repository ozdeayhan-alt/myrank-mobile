import { LinearGradient } from "expo-linear-gradient";
import { memo, useCallback, useMemo } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import { RankingPodiumFrame } from "./RankingPodiumFrame";
import {
  PODIUM_GRADIENT,
  prestigeTierFromRank,
  rankingAccentFromRank,
  type PrestigeTier,
} from "../utils/prestige";
import type { RankingEntry } from "../types";

const LIST_AVATAR_SIZE = 48;
const RANK_COLUMN_WIDTH = 40;
const SCORE_COLUMN_MIN_WIDTH = 72;

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  android: {
    elevation: 2,
  },
  default: {},
});

type RankingPointTrend = {
  direction: "up" | "down";
  label: "Yükselişte" | "Düşüşte";
};

function resolvePointTrend(entry: RankingEntry): RankingPointTrend | null {
  if (typeof entry.tpChange !== "number" || entry.tpChange === 0) {
    return null;
  }
  return entry.tpChange > 0
    ? { direction: "up", label: "Yükselişte" }
    : { direction: "down", label: "Düşüşte" };
}

type RankingEntryRowProps = {
  entry: RankingEntry;
  currentUserId?: string | null;
};

function RankingRankBadge({
  rank,
  tier,
}: {
  rank: number;
  tier: PrestigeTier;
}) {
  const label = rank.toLocaleString("tr-TR");
  const ringColor = tier === "gold" ? "#B8962E" : tier === "silver" ? "#6B7280" : "#A66B28";

  return (
    <LinearGradient
      colors={[...PODIUM_GRADIENT[tier]]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        className="items-center justify-center bg-white"
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
        }}
      >
        <Text
          className="font-bold tabular-nums"
          style={{ fontSize: 13, color: ringColor, lineHeight: 16 }}
        >
          {label}
        </Text>
      </View>
    </LinearGradient>
  );
}

function RankingTrendCapsule({ trend }: { trend: RankingPointTrend }) {
  const isUp = trend.direction === "up";

  return (
    <View
      className={`rounded-full px-2.5 py-1 ${isUp ? "bg-emerald-50" : "bg-rose-50"}`}
      accessibilityLabel={trend.label}
      accessibilityRole="text"
    >
      <Text
        className={`text-[10px] font-semibold tracking-tight ${isUp ? "text-emerald-700" : "text-rose-700"}`}
        numberOfLines={1}
      >
        {isUp ? "↑ " : "↓ "}
        {trend.label}
      </Text>
    </View>
  );
}

function RankingEntryRowInner({
  entry,
  currentUserId = null,
}: RankingEntryRowProps) {
  const openProfile = useCallback(() => {
    navigateToAuthorProfile(entry.userId, currentUserId ?? undefined, {
      displayName: entry.displayName,
      photoURL: entry.photoURL,
    });
  }, [entry.userId, entry.displayName, entry.photoURL, currentUserId]);

  const prestigeTier = prestigeTierFromRank(entry.rank);
  const accent = rankingAccentFromRank(entry.rank);
  const trend = resolvePointTrend(entry);
  const scoreLabel = entry.totalScore.toLocaleString("tr-TR");

  const rankNumber =
    typeof entry.rank === "number" && entry.rank > 0 ? entry.rank : null;

  const accessibilityLabel = useMemo(() => {
    const rankPart =
      rankNumber != null ? `${rankNumber}. sıra` : "sıra bilinmiyor";
    const parts = [entry.displayName, rankPart, `${scoreLabel} puan`, trend?.label].filter(
      Boolean
    );
    return `${parts.join(", ")}. Profili aç`;
  }, [entry.displayName, rankNumber, scoreLabel, trend?.label]);

  const rowContent = (
    <View className="flex-row items-center py-3.5 pl-4 pr-4">
      <View
        className="shrink-0 items-center justify-center"
        style={{ width: RANK_COLUMN_WIDTH }}
      >
        {prestigeTier && rankNumber != null ? (
          <RankingRankBadge rank={rankNumber} tier={prestigeTier} />
        ) : (
          <Text
            className="text-center text-lg font-bold tabular-nums text-gray-500"
            style={accent ? { color: accent.rankColor } : undefined}
          >
            {rankNumber != null ? rankNumber.toLocaleString("tr-TR") : "—"}
          </Text>
        )}
      </View>

      <View className="mx-3 shrink-0">
        <ProfileAvatar
          size={LIST_AVATAR_SIZE}
          photoURL={entry.photoURL}
          fallbackLetter={entry.displayName}
          prestigeTier={prestigeTier}
        />
      </View>

      <Text
        className="min-w-0 flex-1 text-[15px] font-semibold text-gray-900"
        numberOfLines={1}
      >
        {entry.displayName}
      </Text>

      {trend ? (
        <View className="mx-2 shrink-0">
          <RankingTrendCapsule trend={trend} />
        </View>
      ) : null}

      <View
        className="shrink-0 items-end"
        style={{ minWidth: SCORE_COLUMN_MIN_WIDTH }}
      >
        <Text className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
          Puan
        </Text>
        <Text className="text-base font-bold tabular-nums text-gray-900">
          {scoreLabel}
        </Text>
      </View>
    </View>
  );

  if (prestigeTier && rankNumber != null) {
    return (
      <RankingPodiumFrame tier={prestigeTier} rank={rankNumber}>
        <Pressable
          onPress={openProfile}
          className="active:opacity-95"
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          {rowContent}
        </Pressable>
      </RankingPodiumFrame>
    );
  }

  return (
    <Pressable
      onPress={openProfile}
      className="mx-4 mb-2.5 overflow-hidden rounded-2xl bg-white active:opacity-95"
      style={CARD_SHADOW}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {accent && !accent.isPodium ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: accent.stripeColor,
          }}
        />
      ) : null}

      {rowContent}
    </Pressable>
  );
}

export const RankingEntryRow = memo(RankingEntryRowInner);

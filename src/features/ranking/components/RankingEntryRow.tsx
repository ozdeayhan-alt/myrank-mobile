import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { navigateToAuthorProfile } from "@/features/profile/navigateToAuthorProfile";
import {
  formatRankChange,
  formatTpChange,
  TREND_LABEL_TR,
} from "../utils/momentum";
import { prestigeTierFromRank } from "../utils/prestige";
import type { RankingEntry } from "../types";

const LIST_AVATAR_SIZE = 40;

type RankingEntryRowProps = {
  entry: RankingEntry;
  currentUserId?: string | null;
};

function TrendChip({ label }: { label: keyof typeof TREND_LABEL_TR }) {
  const chipClass =
    label === "rising"
      ? "bg-emerald-50"
      : label === "falling"
        ? "bg-rose-50"
        : "bg-gray-100";
  const textClass =
    label === "rising"
      ? "text-emerald-700"
      : label === "falling"
        ? "text-rose-700"
        : "text-gray-600";

  return (
    <View className={`rounded-full px-1.5 py-0.5 ${chipClass}`}>
      <Text className={`text-[10px] font-medium ${textClass}`}>
        {TREND_LABEL_TR[label]}
      </Text>
    </View>
  );
}

function MomentumIndicators({ entry }: { entry: RankingEntry }) {
  const hasRankChange =
    typeof entry.rankChange === "number" && entry.rankChange !== 0;
  const hasTpChange = typeof entry.tpChange === "number" && entry.tpChange !== 0;
  const trendLabel =
    entry.trendLabel === "rising" ||
    entry.trendLabel === "falling" ||
    entry.trendLabel === "stable"
      ? entry.trendLabel
      : null;

  if (!hasRankChange && !hasTpChange && !trendLabel) {
    return null;
  }

  return (
    <View className="mt-0.5 flex-row flex-wrap items-center gap-1.5">
      {hasRankChange ? (
        <Text
          className={`text-[11px] font-semibold ${
            entry.rankChange! > 0 ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {entry.rankChange! > 0 ? "↑ " : "↓ "}
          {formatRankChange(entry.rankChange!)}
        </Text>
      ) : null}

      {hasTpChange ? (
        <Text className="text-[11px] font-medium text-gray-500">
          {formatTpChange(entry.tpChange!)}
        </Text>
      ) : null}

      {trendLabel ? <TrendChip label={trendLabel} /> : null}
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

  return (
    <Pressable
      onPress={openProfile}
      className="mb-2 flex-row items-center justify-between rounded-xl border border-gray-100 px-4 py-3 active:bg-gray-50"
      accessibilityRole="button"
      accessibilityLabel={`${entry.displayName} profilini aç`}
    >
      <View className="mr-2 flex-1 flex-row items-center gap-3">
        <Text className="w-8 text-center text-lg font-bold text-gray-800">
          {entry.rank}
        </Text>

        <ProfileAvatar
          size={LIST_AVATAR_SIZE}
          photoURL={entry.photoURL}
          fallbackLetter={entry.displayName}
          prestigeTier={prestigeTier}
        />

        <View className="min-w-0 flex-1">
          <Text className="text-sm text-gray-700" numberOfLines={1}>
            {entry.displayName}
          </Text>
          <MomentumIndicators entry={entry} />
        </View>
      </View>

      <Text className="text-base font-semibold text-gray-900">
        TP {entry.totalScore}
      </Text>
    </Pressable>
  );
}

export const RankingEntryRow = memo(RankingEntryRowInner);

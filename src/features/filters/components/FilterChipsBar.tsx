import { Pressable, ScrollView, Text, View } from "react-native";
import type { UserMetadata } from "@/features/profile/types";
import { hasActiveSegmentFilters } from "@/features/posts/api/matchesSegmentFilters";
import {
  FILTER_FIELDS,
  formatFilterChipValue,
  isCityFieldDisabled,
  type FilterFieldKey,
} from "../config/filterFields";

const EXPLORE_CHIP_LABELS: Partial<Record<FilterFieldKey, string>> = {
  maritalStatus: "Medeni",
};

function formatExploreChipText(
  key: FilterFieldKey,
  label: string,
  filters: UserMetadata | null
): string {
  const value = formatFilterChipValue(key, filters);
  if (value !== "—") {
    return value;
  }
  return EXPLORE_CHIP_LABELS[key] ?? label;
}

type FilterChipsBarProps = {
  filters: UserMetadata | null;
  onOpenField: (field: FilterFieldKey) => void;
  onResetToGlobal?: () => void;
  onResetToProfile?: () => void;
  globalModeLabel?: string;
  filteredModeLabel?: string;
  /** Smaller padding and chips — legacy Keşfet compact */
  compact?: boolean;
  /** Hide global/filtered label row — Keşfet feed header only */
  hideModeRow?: boolean;
  /** Keşfet: 6 chip tek satır; boşta kategori adı, seçiliyse sadece değer */
  layout?: "scroll" | "exploreRow";
};

export function FilterChipsBar({
  filters,
  onOpenField,
  onResetToGlobal,
  onResetToProfile,
  globalModeLabel = "Global görünüm",
  filteredModeLabel = "Filtreli Görüntü",
  compact = false,
  hideModeRow = false,
  layout = "scroll",
}: FilterChipsBarProps) {
  const isGlobal = !filters || !hasActiveSegmentFilters(filters);
  const isExploreRow = layout === "exploreRow";

  const chips = FILTER_FIELDS.map(({ key, label }) => {
    const value = formatFilterChipValue(key, filters);
    const isActive = value !== "—";
    const isDisabled = key === "city" && isCityFieldDisabled(filters);
    const chipText = isExploreRow
      ? formatExploreChipText(key, label, filters)
      : null;

    return (
      <Pressable
        key={key}
        onPress={() => {
          if (!isDisabled) {
            onOpenField(key);
          }
        }}
        disabled={isDisabled}
        className={
          isExploreRow
            ? `min-w-0 flex-1 items-center rounded-lg border px-0.5 py-2.5 ${
                isDisabled
                  ? "border-gray-100 bg-gray-50 opacity-50"
                  : isActive
                    ? "border-gray-500 bg-gray-50"
                    : "border-gray-200 bg-gray-50"
              }`
            : `rounded-full border ${
                compact ? "px-2 py-1" : "px-3 py-2"
              } ${
                isDisabled
                  ? "border-gray-100 bg-gray-50 opacity-50"
                  : isActive
                    ? "border-gray-400 bg-gray-50"
                    : "border-gray-200 bg-gray-50"
              }`
        }
      >
        {isExploreRow ? (
          <Text
            className={`text-center text-sm ${
              isActive ? "font-semibold text-gray-900" : "font-medium text-gray-600"
            }`}
            numberOfLines={1}
          >
            {chipText} ▾
          </Text>
        ) : compact ? (
          <Text
            className={`text-xs ${
              isActive ? "font-semibold text-gray-900" : "text-gray-600"
            }`}
            numberOfLines={1}
          >
            {label} {value} ▾
          </Text>
        ) : (
          <>
            <Text
              className={`text-xs ${isActive ? "text-gray-600" : "text-gray-500"}`}
            >
              {label}
            </Text>
            <Text
              className={`text-sm font-semibold ${
                isActive ? "text-gray-900" : "text-gray-700"
              }`}
              numberOfLines={1}
            >
              {value} ▾
            </Text>
          </>
        )}
      </Pressable>
    );
  });

  return (
    <View
      className={`border-b border-gray-100 bg-white ${
        isExploreRow ? "py-2.5" : compact ? "py-1.5" : "py-3"
      }`}
    >
      {!hideModeRow ? (
        <View
          className={`flex-row items-center justify-between px-4 ${
            compact ? "mb-1" : "mb-2"
          }`}
        >
          <Text className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {isGlobal ? globalModeLabel : filteredModeLabel}
          </Text>
          <View className="flex-row gap-3">
            {onResetToGlobal ? (
              <Pressable onPress={onResetToGlobal} hitSlop={8}>
                <Text className="text-xs font-semibold text-gray-800">
                  Global&apos;e dön
                </Text>
              </Pressable>
            ) : null}
            {onResetToProfile ? (
              <Pressable onPress={onResetToProfile} hitSlop={8}>
                <Text className="text-xs font-semibold text-gray-500">
                  Profilime göre
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

      {isExploreRow ? (
        <View className="flex-row gap-1 px-3">{chips}</View>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-1.5"
        >
          {chips}
        </ScrollView>
      )}
    </View>
  );
}

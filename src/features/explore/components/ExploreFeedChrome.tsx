import { useMemo } from "react";
import { Text, View } from "react-native";
import { HomeFeedContentFilter } from "@/components/HomeFeedContentFilter";
import { FilterChipsBar } from "@/features/filters/components/FilterChipsBar";
import type { FilterFieldKey } from "@/features/filters/config/filterFields";
import { formatFilterDisplayTitle } from "@/features/filters/utils/formatFilterDisplayTitle";
import type { HomeFeedContentFilter as HomeFeedContentFilterValue } from "@/features/posts/store/useHomeFeedContentStore";
import type { UserMetadata } from "@/features/profile/types";
import { ExploreSearchBarPlaceholder } from "@/features/search/components/ExploreSearchBarPlaceholder";

export type ExploreFeedChromeProps = {
  onPressSearch: () => void;
  filters: UserMetadata | null;
  onOpenField: (field: FilterFieldKey) => void;
  onResetToGlobal?: () => void;
  onResetToProfile?: () => void;
  contentFilter: HomeFeedContentFilterValue;
  onContentFilterChange: (filter: HomeFeedContentFilterValue) => void;
};

export function ExploreFeedChrome({
  onPressSearch,
  filters,
  onOpenField,
  onResetToGlobal,
  onResetToProfile,
  contentFilter,
  onContentFilterChange,
}: ExploreFeedChromeProps) {
  const filterTitle = useMemo(
    () => formatFilterDisplayTitle(filters, "explore"),
    [filters]
  );

  return (
    <View className="bg-white">
      <ExploreSearchBarPlaceholder onPress={onPressSearch} />
      <FilterChipsBar
        filters={filters}
        onOpenField={onOpenField}
        onResetToGlobal={onResetToGlobal}
        onResetToProfile={onResetToProfile}
        hideModeRow
        layout="exploreRow"
      />
      <View className="flex-row items-center border-b border-gray-200 px-4 py-2.5">
        <Text className="flex-1 text-sm font-semibold leading-5 text-gray-900">
          {filterTitle}
        </Text>
      </View>
      <View className="px-4 pt-3">
        <HomeFeedContentFilter
          contentFilter={contentFilter}
          onContentFilterChange={onContentFilterChange}
        />
      </View>
    </View>
  );
}

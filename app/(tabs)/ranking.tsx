import { useScrollToTop } from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/features/auth";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import {
  FilterChipsBar,
  FilterModal,
  formatFilterDisplayTitle,
  DEFAULT_COUNTRY_FILTERS,
  useMetadataFilters,
} from "@/features/filters";
import { hasActiveSegmentFilters } from "@/features/posts/api/matchesSegmentFilters";
import { RankingEntryRow } from "@/features/ranking/components/RankingEntryRow";
import { useSegmentRanking } from "@/features/ranking";
import type { RankingEntry } from "@/features/ranking/types";

export default function RankingScreen() {
  const { user } = useAuth();
  const listRef = useRef<FlashListRef<RankingEntry>>(null);
  useScrollToTop(listRef);

  const {
    filters,
    filtersForModal,
    activeField,
    activeConfig,
    openField,
    closeModal,
    applyField,
    resetToGlobal,
    resetToProfile,
  } = useMetadataFilters({ initialFilters: DEFAULT_COUNTRY_FILTERS });

  const { entries, loading, isRefetching, error, refresh } = useSegmentRanking(filters);

  const isGlobal = !filters || !hasActiveSegmentFilters(filters);
  const filterTitle = useMemo(
    () => formatFilterDisplayTitle(filters, "ranking"),
    [filters]
  );

  const currentUserId = user?.uid ?? null;

  const renderItem = useCallback(
    ({ item }: { item: RankingEntry }) => (
      <RankingEntryRow entry={item} currentUserId={currentUserId} />
    ),
    [currentUserId]
  );

  const listEmpty = useMemo(() => {
    if (loading) {
      return <ActivityIndicator size="large" color="#374151" />;
    }
    if (error) {
      return (
        <View className="rounded-xl bg-amber-50 px-4 py-3">
          <Text className="text-sm text-amber-800">{error}</Text>
        </View>
      );
    }
    return (
      <Text className="text-center text-gray-500">
        {isGlobal
          ? "Henüz global sıralama kaydı yok. Etkileşimler geldikçe liste dolacaktır."
          : "Bu filtrelere uyan sıralama kaydı yok."}
      </Text>
    );
  }, [loading, error, isGlobal]);

  const showRefreshing = isRefetching && entries.length > 0;

  return (
    <TabScreenSafeArea className="flex-1 bg-white">
      <FilterChipsBar
        filters={filters}
        onOpenField={openField}
        onResetToGlobal={resetToGlobal}
        onResetToProfile={resetToProfile}
        globalModeLabel="Global Sıralama"
        hideFilteredModeLabel
      />

      <FilterModal
        visible={activeField !== null}
        field={activeField}
        filterType={activeConfig?.filterType ?? "static"}
        title={activeConfig?.label ?? ""}
        filters={filtersForModal}
        onApply={applyField}
        onClose={closeModal}
      />

      <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-3">
        <Text className="flex-1 text-sm font-semibold leading-5 text-gray-900">
          {filterTitle}
        </Text>
      </View>

      <FlashList
        ref={listRef}
        data={entries}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={showRefreshing} onRefresh={refresh} />
        }
        drawDistance={600}
      />
    </TabScreenSafeArea>
  );
}

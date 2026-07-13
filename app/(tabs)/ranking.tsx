import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useRef } from "react";
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
import { useRankingNavigationStore } from "@/features/ranking/store/useRankingNavigationStore";
import type { RankingEntry } from "@/features/ranking/types";

const RANKING_ROW_ESTIMATE = 88;

export default function RankingScreen() {
  const listRef = useRef<FlashListRef<RankingEntry>>(null);
  const scrollTargetUserIdRef = useRef<string | null>(null);
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
    replaceFilters,
  } = useMetadataFilters({ initialFilters: DEFAULT_COUNTRY_FILTERS });

  const consumeRankingIntent = useRankingNavigationStore((s) => s.consumeIntent);

  useFocusEffect(
    useCallback(() => {
      const intent = consumeRankingIntent();
      if (!intent) {
        return;
      }
      replaceFilters(intent.filters);
      scrollTargetUserIdRef.current = intent.scrollToUserId;
    }, [consumeRankingIntent, replaceFilters])
  );

  const { entries, loading, isRefetching, error, refresh } = useSegmentRanking(filters);

  const scrollToRankingUser = useCallback(() => {
    const targetUserId = scrollTargetUserIdRef.current;
    if (!targetUserId || loading || entries.length === 0) {
      return;
    }

    const index = entries.findIndex((entry) => entry.userId === targetUserId);
    scrollTargetUserIdRef.current = null;

    if (index < 0) {
      return;
    }

    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.35,
      });
    });
  }, [entries, loading]);

  useEffect(() => {
    scrollToRankingUser();
  }, [scrollToRankingUser]);

  const { user } = useAuth();

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

  const listContentStyle = useMemo(
    () => ({ paddingHorizontal: 0, paddingTop: 12, paddingBottom: 16 }),
    []
  );

  return (
    <TabScreenSafeArea className="flex-1 bg-gray-50">
      <FilterChipsBar
        filters={filters}
        onOpenField={openField}
        onResetToGlobal={resetToGlobal}
        onResetToProfile={resetToProfile}
        globalModeLabel="Global Sıralama"
        hideModeRow
      />

      <FilterModal
        visible={activeField !== null}
        field={activeField}
        filterType={activeConfig?.filterType ?? "static"}
        title={activeConfig?.label ?? ""}
        filters={filtersForModal}
        onApply={applyField}
        onClose={closeModal}
        onResetToGlobal={resetToGlobal}
      />

      <View className="flex-row items-center border-b border-gray-200/80 bg-white px-4 py-3">
        <Text className="flex-1 text-sm font-semibold leading-5 text-gray-800">
          {filterTitle}
        </Text>
      </View>

      <FlashList
        className="flex-1"
        ref={listRef}
        data={entries}
        keyExtractor={(item) => item.userId}
        renderItem={renderItem}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={listContentStyle}
        refreshControl={
          <RefreshControl refreshing={showRefreshing} onRefresh={refresh} />
        }
        drawDistance={600}
        estimatedItemSize={RANKING_ROW_ESTIMATE}
        onScrollToIndexFailed={({ index }) => {
          listRef.current?.scrollToOffset({
            offset: Math.max(0, index * RANKING_ROW_ESTIMATE),
            animated: true,
          });
        }}
      />
    </TabScreenSafeArea>
  );
}

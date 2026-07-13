import {
  useFocusEffect,
  useIsFocused,
  useScrollToTop,
} from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useAuth } from "@/features/auth";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { toFeedApiContentType } from "@/features/feed/feedContentType";
import { ExploreFeedChrome } from "@/features/explore/components/ExploreFeedChrome";
import { useExploreFeedInfinite } from "@/features/explore/hooks/useExploreFeedInfinite";
import {
  DEFAULT_COUNTRY_FILTERS,
  FilterChipsBar,
  FilterModal,
  formatFilterDisplayTitle,
  useMetadataFilters,
} from "@/features/filters";
import { getFilterSegmentLabel } from "@/features/filters/utils/segmentLabel";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { getEmptyFeedMessage } from "@/features/posts/constants/contentTypeLabels";
import { DEFAULT_LIST_HORIZONTAL_INSET } from "@/features/posts/constants/feedMediaLayout";
import { hasActiveSegmentFilters } from "@/features/posts/api/matchesSegmentFilters";
import type { HomeFeedContentFilter } from "@/features/posts/store/useHomeFeedContentStore";
import {
  ExploreSearchBar,
  useUserSearch,
  UserSearchResults,
} from "@/features/search";
import { isFeedV2Enabled } from "@/lib/featureFlags/feedFlags";
import { FlowFeedScreen } from "@/features/flow/components/FlowFeedScreen";
import { usePrefetchFlowFeed } from "@/features/flow/hooks/usePrefetchFlowFeed";
import { mapPostsToLegacyFeedItems } from "@/features/flow/utils/groupPostsForMixedFeed";
import {
  FeedScroller,
  useExploreFeedEngine,
  type FeedV2ListItem,
} from "@/features/feed-v2";

export default function ExploreScreen() {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const feedV2 = isFeedV2Enabled(user?.uid ?? null);
  const legacyListRef = useRef<FlashListRef<FeedListItem>>(null);
  const v2ListRef = useRef<FlashListRef<FeedV2ListItem>>(null);
  useScrollToTop(feedV2 ? v2ListRef : legacyListRef);

  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [contentFilter, setContentFilter] = useState<HomeFeedContentFilter>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearchPanelOpen(false);
      };
    }, [])
  );

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    clearQuery: clearSearchQuery,
    isSearchActive,
    users: searchUsers,
    loading: searchLoading,
    error: searchError,
  } = useUserSearch();

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

  const showSearchUI = searchPanelOpen || isSearchActive;
  const isFlowMode = contentFilter === "flow" && !showSearchUI;
  const feedEnabled = !showSearchUI && !isFlowMode;
  const apiContentType = toFeedApiContentType(contentFilter);

  usePrefetchFlowFeed({
    variant: "explore",
    filters,
    enabled: isFocused && !isFlowMode && !showSearchUI,
  });

  const {
    posts,
    loading,
    error,
    refresh,
    updatePostScore,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
    isRefetching,
  } = useExploreFeedInfinite(filters, apiContentType, feedEnabled && !feedV2);

  const v2Engine = useExploreFeedEngine(
    filters,
    apiContentType,
    feedEnabled && feedV2
  );

  const engagementResetKey = useMemo(
    () => `${getFilterSegmentLabel(filters)}-${apiContentType}`,
    [filters, apiContentType]
  );

  const isGlobal = !filters || !hasActiveSegmentFilters(filters);

  const filterTitle = useMemo(
    () => formatFilterDisplayTitle(filters, "explore"),
    [filters]
  );

  const handlePressSearch = useCallback(() => {
    setSearchPanelOpen(true);
  }, []);

  const handleClearSearch = useCallback(() => {
    clearSearchQuery();
    setSearchPanelOpen(false);
  }, [clearSearchQuery]);

  const prevShowSearchUI = useRef(showSearchUI);
  const prevSearchQuery = useRef(searchQuery);
  useEffect(() => {
    if (
      prevShowSearchUI.current &&
      !showSearchUI &&
      prevSearchQuery.current.trim().length > 0
    ) {
      void (feedV2 ? v2Engine.refresh() : refresh());
    }
    prevShowSearchUI.current = showSearchUI;
    prevSearchQuery.current = searchQuery;
  }, [showSearchUI, searchQuery, refresh, feedV2, v2Engine]);

  const emptyMessage = useMemo(() => {
    if (contentFilter === "flow") {
      return "Bu akışta henüz Flow yok.";
    }
    if (contentFilter === "tweet" || contentFilter === "image") {
      return getEmptyFeedMessage(contentFilter);
    }
    if (isGlobal) {
      return "Henüz gönderi yok. Düello kartı en az bir gönderi olduğunda feed içinde görünür.";
    }
    return "Bu filtrelere uyan gönderi bulunamadı. Düello kartı gönderi listesi boşken gösterilmez.";
  }, [isGlobal, contentFilter]);

  const listHeader = useMemo(
    () => (
      <ExploreFeedChrome
        onPressSearch={handlePressSearch}
        filters={filters}
        onOpenField={openField}
        onResetToGlobal={resetToGlobal}
        onResetToProfile={resetToProfile}
        contentFilter={contentFilter}
        onContentFilterChange={setContentFilter}
      />
    ),
    [
      contentFilter,
      filters,
      handlePressSearch,
      openField,
      resetToGlobal,
      resetToProfile,
    ]
  );

  const feedListContentStyle = useMemo(
    () => ({
      paddingHorizontal: DEFAULT_LIST_HORIZONTAL_INSET,
      paddingTop: 0,
      paddingBottom: 16,
    }),
    []
  );

  const feedItems = useMemo(
    (): FeedListItem[] => mapPostsToLegacyFeedItems(posts),
    [posts]
  );

  const handleRefresh = useCallback(() => {
    if (feedV2) {
      void v2Engine.refresh();
    } else {
      void refresh();
    }
  }, [feedV2, refresh, v2Engine]);

  return (
    <>
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

      <TabScreenSafeArea className="flex-1 bg-gray-50">
        {showSearchUI ? (
          <View className="min-h-0 flex-1">
            <ExploreSearchBar
              query={searchQuery}
              onChangeQuery={setSearchQuery}
              onClear={handleClearSearch}
            />
            <FilterChipsBar
              filters={filters}
              onOpenField={openField}
              onResetToGlobal={resetToGlobal}
              onResetToProfile={resetToProfile}
              hideModeRow
              layout="exploreRow"
            />
            <View className="flex-row items-center border-b border-gray-200 bg-white px-4 py-2.5">
              <Text className="flex-1 text-sm font-semibold leading-5 text-gray-900">
                {filterTitle}
              </Text>
            </View>
            <UserSearchResults
              query={searchQuery}
              users={searchUsers}
              loading={searchLoading}
              error={searchError}
            />
          </View>
        ) : isFlowMode ? (
          <View className="min-h-0 flex-1">
            <FlowFeedScreen
              variant="explore"
              filters={filters}
              enabled={isFocused}
              ListHeaderComponent={listHeader}
              emptyMessage={emptyMessage}
            />
          </View>
        ) : feedV2 ? (
          <View className="min-h-0 flex-1">
            <FeedScroller
              items={v2Engine.items}
              loading={v2Engine.loading}
              error={v2Engine.error}
              emptyMessage={emptyMessage}
              onRefresh={handleRefresh}
              onScoreUpdate={v2Engine.updatePostScore}
              ListHeaderComponent={listHeader}
              contentContainerStyle={feedListContentStyle}
              hasNextPage={v2Engine.hasNextPage}
              isFetchingNextPage={v2Engine.isFetchingNextPage}
              isFetching={v2Engine.isFetching}
              onLoadMore={v2Engine.fetchNextPage}
              isRefetching={v2Engine.isRefetching}
              engagementResetKey={engagementResetKey}
              listKey={engagementResetKey}
              listRef={v2ListRef}
              currentUserId={user?.uid ?? null}
              exploreFilters={filters}
              prefetchEnabled={isFocused}
            />
          </View>
        ) : (
          <View className="min-h-0 flex-1">
            <FeedFlashList
              items={feedItems}
              loading={loading}
              error={error}
              emptyMessage={emptyMessage}
              onRefresh={handleRefresh}
              onScoreUpdate={updatePostScore}
              ListHeaderComponent={listHeader}
              contentContainerStyle={feedListContentStyle}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              isFetching={isFetching}
              onLoadMore={fetchNextPage}
              isRefetching={isRefetching}
              engagementResetKey={engagementResetKey}
              listKey={engagementResetKey}
              listRef={legacyListRef}
              currentUserId={user?.uid ?? null}
              exploreFilters={filters}
              prefetchEnabled={isFocused}
            />
          </View>
        )}
      </TabScreenSafeArea>
    </>
  );
}

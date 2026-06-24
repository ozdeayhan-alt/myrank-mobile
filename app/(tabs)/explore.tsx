import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useAuth } from "@/features/auth";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { ExploreFeedChrome } from "@/features/explore/components/ExploreFeedChrome";
import { useExploreFeedInfinite } from "@/features/explore/hooks/useExploreFeedInfinite";
import {
  DEFAULT_COUNTRY_FILTERS,
  FilterChipsBar,
  FilterModal,
  formatFilterDisplayTitle,
  useMetadataFilters,
} from "@/features/filters";
import {
  FeedFlashList,
  type FeedListItem,
} from "@/features/posts/components/FeedFlashList";
import { hasActiveSegmentFilters } from "@/features/posts/api/matchesSegmentFilters";
import { collectVideoPostsForPlaylist } from "@/features/posts/utils/videoPosts";
import {
  ExploreSearchBar,
  useUserSearch,
  UserSearchResults,
} from "@/features/search";

export default function ExploreScreen() {
  const { user } = useAuth();
  const listRef = useRef<FlashListRef<FeedListItem>>(null);
  useScrollToTop(listRef);

  const [searchPanelOpen, setSearchPanelOpen] = useState(false);

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

  const {
    posts,
    loading,
    error,
    refresh,
    updatePostScore,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isRefetching,
    engagementResetKey,
  } = useExploreFeedInfinite(filters, !showSearchUI);

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
  useEffect(() => {
    if (prevShowSearchUI.current && !showSearchUI) {
      void refresh();
    }
    prevShowSearchUI.current = showSearchUI;
  }, [showSearchUI, refresh]);

  const emptyMessage = isGlobal
    ? "Henüz gönderi yok."
    : "Bu filtrelere uyan gönderi bulunamadı.";

  const listHeader = useMemo(
    () => (
      <ExploreFeedChrome
        onPressSearch={handlePressSearch}
        filters={filters}
        onOpenField={openField}
        onResetToGlobal={resetToGlobal}
        onResetToProfile={resetToProfile}
      />
    ),
    [handlePressSearch, filters, openField, resetToGlobal, resetToProfile]
  );

  const feedListContentStyle = useMemo(
    () => ({
      paddingHorizontal: 16,
      paddingTop: 0,
      paddingBottom: 16,
    }),
    []
  );

  const feedItems = useMemo(
    (): FeedListItem[] =>
      posts.map((post) => ({
        kind: "post" as const,
        key: post.id,
        post,
      })),
    [posts]
  );

  const videoPosts = useMemo(() => collectVideoPostsForPlaylist(posts), [posts]);

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <TabScreenSafeArea className="flex-1 bg-gray-50">
      <FilterModal
        visible={activeField !== null}
        field={activeField}
        filterType={activeConfig?.filterType ?? "static"}
        title={activeConfig?.label ?? ""}
        filters={filtersForModal}
        onApply={applyField}
        onClose={closeModal}
      />

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
      ) : (
        <View className="min-h-0 flex-1">
          <FeedFlashList
            items={feedItems}
            videoPosts={videoPosts}
            loading={loading}
            error={error}
            emptyMessage={emptyMessage}
            onRefresh={handleRefresh}
            onScoreUpdate={updatePostScore}
            ListHeaderComponent={listHeader}
            contentContainerStyle={feedListContentStyle}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
            isRefetching={isRefetching}
            engagementResetKey={engagementResetKey}
            listRef={listRef}
            currentUserId={user?.uid ?? null}
            reelsSource="explore"
            exploreFilters={filters}
          />
        </View>
      )}
    </TabScreenSafeArea>
  );
}

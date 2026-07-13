import { memo, useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import type { Post } from "@/features/posts/types";
import {
  FLOW_CARD_ASPECT_RATIO,
  FLOW_GRID_GAP,
  FLOW_MAX_AUTOPLAY_CARDS,
} from "../constants";
import { FlowVideoCard } from "./FlowVideoCard";

type FlowGridRow = {
  key: string;
  left: Post;
  right?: Post;
};

type FlowGridProps = {
  posts: Post[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onRefresh?: () => void;
  isRefetching?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  horizontalPadding?: number;
  ListHeaderComponent?: React.ReactElement | null;
};

function buildRows(posts: Post[]): FlowGridRow[] {
  const rows: FlowGridRow[] = [];
  for (let index = 0; index < posts.length; index += 2) {
    rows.push({
      key: posts[index].id,
      left: posts[index],
      right: posts[index + 1],
    });
  }
  return rows;
}

export const FlowGrid = memo(function FlowGrid({
  posts,
  loading = false,
  error = null,
  emptyMessage = "Henüz Flow yok.",
  onRefresh,
  isRefetching = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  horizontalPadding = 16,
  ListHeaderComponent = null,
}: FlowGridProps) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  const cardWidth = useMemo(() => {
    const usable = windowWidth - horizontalPadding * 2 - FLOW_GRID_GAP;
    return Math.floor(usable / 2);
  }, [horizontalPadding, windowWidth]);

  const rows = useMemo(() => buildRows(posts), [posts]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<FlowGridRow>[] }) => {
      const firstVisibleId =
        viewableItems
          .filter((entry) => entry.isViewable)
          .flatMap((entry) =>
            [entry.item.left.id, entry.item.right?.id].filter(Boolean)
          )[0] ?? null;

      setActivePreviewId((prev) =>
        prev === firstVisibleId ? prev : firstVisibleId
      );
    },
    []
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 60,
      minimumViewTime: 120,
    }),
    []
  );

  const handlePressPost = useCallback(
    (postId: string) => {
      router.push(`/flow/${postId}`);
    },
    [router]
  );

  const renderCard = useCallback(
    (post: Post) => (
      <Pressable
        onPress={() => handlePressPost(post.id)}
        style={{ width: cardWidth }}
        accessibilityRole="button"
        accessibilityLabel={post.title ?? "Flow videosu"}
      >
        <FlowVideoCard
          post={post}
          width={cardWidth}
          previewActive={
            FLOW_MAX_AUTOPLAY_CARDS > 0 && activePreviewId === post.id
          }
        />
      </Pressable>
    ),
    [activePreviewId, cardWidth, handlePressPost]
  );

  const renderItem = useCallback(
    ({ item }: { item: FlowGridRow }) => (
      <View
        style={{
          flexDirection: "row",
          gap: FLOW_GRID_GAP,
          marginBottom: FLOW_GRID_GAP,
        }}
      >
        {renderCard(item.left)}
        {item.right ? renderCard(item.right) : <View style={{ width: cardWidth }} />}
      </View>
    ),
    [cardWidth, renderCard]
  );

  const listEmpty = useMemo(() => {
    if (loading) {
      return (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color="#374151" />
        </View>
      );
    }

    if (error) {
      return (
        <View className="mx-4 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      );
    }

    return (
      <View className="items-center px-6 py-16">
        <Text className="text-center text-sm text-gray-500">{emptyMessage}</Text>
      </View>
    );
  }, [emptyMessage, error, loading]);

  const footer = useMemo(() => {
    if (!isFetchingNextPage) {
      return <View style={{ height: 16 }} />;
    }
    return (
      <View className="items-center py-4">
        <ActivityIndicator size="small" color="#6B7280" />
      </View>
    );
  }, [isFetchingNextPage]);

  return (
    <FlashList
      data={rows}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      ListHeaderComponent={ListHeaderComponent ?? undefined}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={footer}
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingBottom: 24,
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        ) : undefined
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          onLoadMore?.();
        }
      }}
      onEndReachedThreshold={0.6}
      removeClippedSubviews
    />
  );
});

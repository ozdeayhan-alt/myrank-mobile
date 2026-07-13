import { memo, useCallback, useEffect } from "react";
import { View } from "react-native";
import { FlowGrid } from "../components/FlowGrid";
import { useFlowFeedInfinite, type FlowFeedVariant } from "../hooks/useFlowFeedInfinite";
import { useFlowViewerSessionStore } from "../store/useFlowViewerSessionStore";
import type { UserMetadata } from "@/features/profile/types";

type FlowFeedScreenProps = {
  variant: FlowFeedVariant;
  filters?: UserMetadata | null;
  authorId?: string;
  enabled?: boolean;
  emptyMessage?: string;
  ListHeaderComponent?: React.ReactElement | null;
  horizontalPadding?: number;
};

export const FlowFeedScreen = memo(function FlowFeedScreen({
  variant,
  filters = null,
  authorId,
  enabled = true,
  emptyMessage = "Henüz Flow yok.",
  ListHeaderComponent = null,
  horizontalPadding = 16,
}: FlowFeedScreenProps) {
  const setSession = useFlowViewerSessionStore((state) => state.setSession);

  useEffect(() => {
    setSession({
      variant,
      filters,
      authorId: authorId ?? null,
    });
  }, [authorId, filters, setSession, variant]);

  const {
    posts,
    loading,
    error,
    refresh,
    isRefetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFlowFeedInfinite({
    variant,
    filters,
    authorId,
    enabled,
  });

  const handleRefresh = useCallback(() => {
    void refresh();
  }, [refresh]);

  return (
    <View className="min-h-0 flex-1 bg-white">
      <FlowGrid
        posts={posts}
        loading={loading}
        error={error}
        emptyMessage={emptyMessage}
        onRefresh={handleRefresh}
        isRefetching={isRefetching}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        horizontalPadding={horizontalPadding}
        ListHeaderComponent={ListHeaderComponent}
      />
    </View>
  );
});

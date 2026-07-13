import { memo, useCallback, useMemo } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import type { Post } from "@/features/posts/types";
import { FLOW_GRID_GAP } from "../constants";
import { FlowVideoCard } from "./FlowVideoCard";

type FlowInlineGridProps = {
  posts: Post[];
  horizontalPadding?: number;
};

type GridRow = {
  key: string;
  left: Post;
  right?: Post;
};

function buildRows(posts: Post[]): GridRow[] {
  const rows: GridRow[] = [];
  for (let index = 0; index < posts.length; index += 2) {
    rows.push({
      key: `${posts[index].id}:${posts[index + 1]?.id ?? ""}`,
      left: posts[index],
      right: posts[index + 1],
    });
  }
  return rows;
}

export const FlowInlineGrid = memo(function FlowInlineGrid({
  posts,
  horizontalPadding = 0,
}: FlowInlineGridProps) {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();

  const contentWidth = windowWidth - horizontalPadding * 2;
  const cardWidth = useMemo(() => {
    const usable = contentWidth - FLOW_GRID_GAP;
    return Math.floor(usable / 2);
  }, [contentWidth]);

  const rows = useMemo(() => buildRows(posts), [posts]);

  const handlePress = useCallback(
    (postId: string) => {
      router.push(`/flow/${postId}`);
    },
    [router]
  );

  const renderCard = useCallback(
    (post: Post) => (
      <Pressable
        onPress={() => handlePress(post.id)}
        style={{ width: cardWidth }}
        accessibilityRole="button"
        accessibilityLabel={post.title ?? "Flow videosu"}
      >
        <FlowVideoCard post={post} width={cardWidth} previewActive={false} />
      </Pressable>
    ),
    [cardWidth, handlePress]
  );

  if (posts.length === 0) {
    return null;
  }

  return (
    <View style={{ marginBottom: 12 }}>
      {rows.map((row) => (
        <View
          key={row.key}
          style={{
            flexDirection: "row",
            gap: FLOW_GRID_GAP,
            marginBottom: FLOW_GRID_GAP,
          }}
        >
          {renderCard(row.left)}
          {row.right ? (
            renderCard(row.right)
          ) : (
            <View style={{ width: cardWidth }} />
          )}
        </View>
      ))}
    </View>
  );
});

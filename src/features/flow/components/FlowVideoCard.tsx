import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import type { Post } from "@/features/posts/types";
import { FLOW_CARD_ASPECT_RATIO } from "../constants";
import { FlowPreviewPlayer } from "./FlowPreviewPlayer";

type FlowTpBadgeProps = {
  score: number;
};

function FlowTpBadge({ score }: FlowTpBadgeProps) {
  return (
    <View style={styles.tpBadge} pointerEvents="none">
      <Text style={styles.tpLabel}>TP</Text>
      <Text style={styles.tpValue}>{score}</Text>
    </View>
  );
}

type FlowVideoCardProps = {
  post: Post;
  width: number;
  previewActive: boolean;
};

export const FlowVideoCard = memo(function FlowVideoCard({
  post,
  width,
  previewActive,
}: FlowVideoCardProps) {
  const height = useMemo(
    () => Math.round(width / FLOW_CARD_ASPECT_RATIO),
    [width]
  );
  const thumbnailUrl = post.thumbnailUrl ?? post.posterURL;

  return (
    <View style={[styles.card, { width, height }]}>
      {previewActive && post.provider && post.providerVideoId ? (
        <FlowPreviewPlayer post={post} width={width} height={height} />
      ) : thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={post.id}
          transition={120}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]} />
      )}
      <FlowTpBadge score={post.postScore ?? 0} />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111827",
  },
  placeholder: {
    backgroundColor: "#374151",
  },
  tpBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  tpLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 9,
    fontWeight: "600",
  },
  tpValue: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});

import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Post } from "@/features/posts/types";
import { FLOW_PLAYER_CTA_TEXT } from "../constants/flowPlayerCopy";

type FlowPlayerSlateProps = {
  post: Post;
  width: number;
  height: number;
  showLoading?: boolean;
};

export const FlowPlayerSlate = memo(function FlowPlayerSlate({
  post,
  width,
  height,
  showLoading = true,
}: FlowPlayerSlateProps) {
  const thumbnailUrl = post.thumbnailUrl ?? post.posterURL;

  return (
    <View style={[styles.container, { width, height }]}>
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={`${post.id}-slate`}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.82)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {showLoading ? (
        <View style={styles.messageWrap} pointerEvents="none">
          <Text style={styles.messageText}>{FLOW_PLAYER_CTA_TEXT}</Text>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#111827",
  },
  fallback: {
    backgroundColor: "#1F2937",
  },
  messageWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  messageText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

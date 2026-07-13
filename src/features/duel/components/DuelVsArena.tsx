import { Image } from "expo-image";
import { memo, useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { DEFAULT_LIST_HORIZONTAL_INSET } from "@/features/posts/constants/feedMediaLayout";
import type { Post } from "@/features/posts/types";
import {
  resolvePostAuthorDisplayName,
  resolvePostAuthorInitial,
  resolvePostAuthorPhotoURL,
} from "@/features/posts/utils/resolvePostAuthor";
import { listAvatarDisplayCandidateUrls } from "@/lib/media/resolveMediaDisplayUrl";
import { useDuelAuthorTopRanking } from "../hooks/useDuelAuthorTopRanking";
import { DUEL_FEED_AVATAR_SIZE } from "../lib/duelRoundLayout";
import { DuelVsBadge } from "./DuelVsBadge";

const DEFAULT_VS_RATIO = 58 / 320;
const FEED_AVATAR_SIZE = DUEL_FEED_AVATAR_SIZE;
const FEED_VS_SPACER_WIDTH = 60;
const FEED_VS_SIZE = 68;

type DuelHalfProps = {
  post: Post | null;
  placeholderTextClassName?: string;
};

function resolveAvatarUri(post: Post | null): string | undefined {
  if (!post) {
    return undefined;
  }
  return listAvatarDisplayCandidateUrls(resolvePostAuthorPhotoURL(post))[0];
}

function DuelHalf({
  post,
  placeholderTextClassName = "text-lg font-bold text-gray-500",
}: DuelHalfProps) {
  const imageUri = useMemo(() => resolveAvatarUri(post), [post]);
  const initial = post ? resolvePostAuthorInitial(post) : "?";

  return (
    <View style={styles.half}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View className="h-full w-full items-center justify-center bg-gray-100">
          <Text className={placeholderTextClassName}>{initial}</Text>
        </View>
      )}
    </View>
  );
}

type DuelParticipantColumnProps = {
  post: Post | null;
  avatarSize: number;
  rankingsEnabled: boolean;
  showRanking: boolean;
};

function DuelParticipantColumn({
  post,
  avatarSize,
  rankingsEnabled,
  showRanking,
}: DuelParticipantColumnProps) {
  const imageUri = useMemo(() => resolveAvatarUri(post), [post]);
  const initial = post ? resolvePostAuthorInitial(post) : "?";
  const displayName = post ? resolvePostAuthorDisplayName(post) : "—";
  const rankingLabel = useDuelAuthorTopRanking(post, rankingsEnabled && showRanking);

  return (
    <View style={styles.participantColumn}>
      <View
        style={[
          styles.participantAvatar,
          { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
        ]}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-gray-100">
            <Text className="text-lg font-bold text-gray-500">{initial}</Text>
          </View>
        )}
      </View>
      <Text
        className="mt-2 text-center text-sm font-semibold text-gray-900"
        numberOfLines={1}
      >
        {displayName}
      </Text>
      {showRanking ? (
        <Text
          className="mt-0.5 text-center text-xs text-gray-500"
          numberOfLines={1}
        >
          {rankingLabel ?? "Sıralama yok"}
        </Text>
      ) : null}
    </View>
  );
}

type DuelVsArenaProps = {
  postA: Post | null;
  postB: Post | null;
  /** Kare arena kenarı; verilmezse feed genişliği kullanılır. */
  arenaSize?: number;
  /** Dikdörtgen önizleme yüksekliği; verilmezse arenaSize ile kare olur. */
  arenaHeight?: number;
  /** Feed kartı: avatar altında isim + sıralama */
  showParticipantDetails?: boolean;
  rankingsEnabled?: boolean;
};

function DuelVsArenaInner({
  postA,
  postB,
  arenaSize: arenaSizeProp,
  arenaHeight: arenaHeightProp,
  showParticipantDetails = false,
  rankingsEnabled = false,
}: DuelVsArenaProps) {
  const { width: screenWidth } = useWindowDimensions();
  const arenaWidth =
    arenaSizeProp ?? screenWidth - DEFAULT_LIST_HORIZONTAL_INSET * 2;
  const arenaHeight = arenaHeightProp ?? arenaWidth;
  const vsSize = Math.max(
    28,
    Math.round(Math.min(arenaWidth, arenaHeight) * DEFAULT_VS_RATIO)
  );
  const compact = arenaHeight < arenaWidth * 0.75;
  const previewAvatarSize = compact
    ? Math.round(Math.min(arenaHeight * 0.62, 56))
    : FEED_AVATAR_SIZE;

  if (showParticipantDetails) {
    return (
      <View style={[styles.feedArena, { width: arenaWidth }]}>
        <DuelParticipantColumn
          post={postA}
          avatarSize={FEED_AVATAR_SIZE}
          rankingsEnabled={rankingsEnabled}
          showRanking
        />
        <View style={styles.feedVsSpacer} />
        <DuelParticipantColumn
          post={postB}
          avatarSize={FEED_AVATAR_SIZE}
          rankingsEnabled={rankingsEnabled}
          showRanking
        />
        <View pointerEvents="none" style={styles.feedVsOverlay}>
          <DuelVsBadge size={FEED_VS_SIZE} />
        </View>
      </View>
    );
  }

  if (compact) {
    return (
      <View
        style={[
          styles.previewArena,
          styles.arenaCompact,
          { width: arenaWidth, minHeight: arenaHeight + 36 },
        ]}
      >
        <View style={styles.previewRow}>
          <DuelParticipantColumn
            post={postA}
            avatarSize={previewAvatarSize}
            rankingsEnabled={rankingsEnabled}
            showRanking
          />
          <View style={styles.feedVs}>
            <DuelVsBadge size={vsSize} />
          </View>
          <DuelParticipantColumn
            post={postB}
            avatarSize={previewAvatarSize}
            rankingsEnabled={rankingsEnabled}
            showRanking
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.arena,
        { width: arenaWidth, height: arenaHeight },
      ]}
    >
      <DuelHalf post={postA} />
      <View style={styles.seam} />
      <DuelHalf post={postB} />
      <View pointerEvents="none" style={styles.vsOverlay}>
        <DuelVsBadge size={vsSize} />
      </View>
    </View>
  );
}

export const DuelVsArena = memo(DuelVsArenaInner);

/** Feed kartı arena + alt CTA için yaklaşık minimum yükseklik. */
export function getDuelFeedCardMinHeight(screenWidth: number): number {
  const arenaSize = screenWidth - DEFAULT_LIST_HORIZONTAL_INSET * 2;
  return arenaSize + 168;
}

const styles = StyleSheet.create({
  arena: {
    alignSelf: "center",
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  arenaCompact: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
  },
  previewArena: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  feedArena: {
    position: "relative",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  feedVsSpacer: {
    width: FEED_VS_SPACER_WIDTH,
    paddingTop: 28,
    paddingHorizontal: 8,
  },
  feedVsOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 42,
    alignItems: "center",
    zIndex: 10,
  },
  feedVs: {
    paddingTop: 28,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  participantColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  participantAvatar: {
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  half: {
    flex: 1,
    overflow: "hidden",
  },
  seam: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E7EB",
  },
  vsOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { VOTE_UP_BLUE } from "./profileFollowButtonTheme";
import { useFullSegmentRank } from "../hooks/useFullSegmentRank";
import type { UserMetadata } from "../types";

const SEGMENT_RANK_DEFER_MS = 350;
const MYRANK_GRADIENT = ["#6A9EE8", VOTE_UP_BLUE, "#0550D0"] as const;

type ProfileMyRankSegmentBadgeProps = {
  userId: string;
  metadata: UserMetadata;
  isOwnProfile: boolean;
  enabled?: boolean;
  onPress?: () => void;
};

function ProfileMyRankSegmentBadgeInner({
  userId,
  metadata,
  isOwnProfile,
  enabled = true,
  onPress,
}: ProfileMyRankSegmentBadgeProps) {
  const [segmentRankEnabled, setSegmentRankEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setSegmentRankEnabled(false);
      return;
    }
    setSegmentRankEnabled(false);
    const timer = setTimeout(
      () => setSegmentRankEnabled(true),
      SEGMENT_RANK_DEFER_MS
    );
    return () => clearTimeout(timer);
  }, [userId, enabled]);

  const { rank, loading } = useFullSegmentRank(
    userId,
    metadata,
    isOwnProfile,
    enabled && segmentRankEnabled
  );

  const labelPrefix = isOwnProfile ? "MyRank Sıran" : "MyRank Sırası";

  const label = useMemo(() => {
    if (loading && rank === null) {
      return labelPrefix;
    }
    if (rank === null) {
      return `${labelPrefix} —`;
    }
    return `${labelPrefix} ${rank.toLocaleString("tr-TR")}.`;
  }, [labelPrefix, loading, rank]);

  const accessibilityLabel =
    rank === null
      ? `${labelPrefix} bilinmiyor`
      : `${labelPrefix} ${rank.toLocaleString("tr-TR")}`;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.shadow,
        onPress && pressed ? { opacity: 0.88 } : undefined,
      ]}
    >
      <LinearGradient
        colors={[...MYRANK_GRADIENT]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.capsule}
      >
        {loading && rank === null ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="podium-outline" size={14} color="#FFFFFF" />
        )}
        <Text style={styles.text} numberOfLines={1}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

export const ProfileMyRankSegmentBadge = memo(ProfileMyRankSegmentBadgeInner);

const styles = StyleSheet.create({
  shadow: {
    alignSelf: "center",
    shadowColor: VOTE_UP_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === "android" ? 0 : 0.22,
    shadowRadius: 4,
    elevation: 3,
  },
  capsule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    maxWidth: 280,
  },
  text: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

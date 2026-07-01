import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { useFullSegmentRank } from "../hooks/useFullSegmentRank";
import type { UserMetadata } from "../types";

const SEGMENT_RANK_DEFER_MS = 350;
const MEDAL_SIZE = 54;
const INNER_SIZE = 42;
const LOADING_COLOR = "#9ca3af";

const MEDAL_GRADIENT = ["#F5E6A3", "#D4AF37", "#B8962E"] as const;

type ProfileRankMedalProps = {
  userId: string;
  metadata: UserMetadata;
  isOwnProfile: boolean;
};

function ProfileRankMedalInner({
  userId,
  metadata,
  isOwnProfile,
}: ProfileRankMedalProps) {
  const [segmentRankEnabled, setSegmentRankEnabled] = useState(false);

  useEffect(() => {
    setSegmentRankEnabled(false);
    const timer = setTimeout(
      () => setSegmentRankEnabled(true),
      SEGMENT_RANK_DEFER_MS
    );
    return () => clearTimeout(timer);
  }, [userId]);

  const { rank, loading } = useFullSegmentRank(
    userId,
    metadata,
    isOwnProfile,
    segmentRankEnabled
  );

  const rankLabel =
    loading && rank === null ? null : rank === null ? "—" : String(rank);

  const accessibilityLabel =
    rank === null
      ? "MyRank sırası bilinmiyor"
      : `MyRank sırası ${rank}`;

  return (
    <View
      className="items-center"
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
      collapsable={false}
    >
      <Text
        className="font-semibold text-[#A39060]"
        style={{ fontSize: 9, letterSpacing: 0.4, marginBottom: 4 }}
      >
        MyRank
      </Text>

      <LinearGradient
        colors={[...MEDAL_GRADIENT]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          width: MEDAL_SIZE,
          height: MEDAL_SIZE,
          borderRadius: MEDAL_SIZE / 2,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#B8962E",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.28,
          shadowRadius: 4,
          elevation: Platform.OS === "android" ? 3 : 0,
        }}
      >
        <View
          style={{
            width: INNER_SIZE,
            height: INNER_SIZE,
            borderRadius: INNER_SIZE / 2,
            backgroundColor: "#FFFBF0",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.65)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {rankLabel === null ? (
            <ActivityIndicator size="small" color={LOADING_COLOR} />
          ) : (
            <Text
              className="font-bold tabular-nums text-gray-900"
              style={{ fontSize: 18, lineHeight: 22, letterSpacing: -0.5 }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {rankLabel}
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

export const ProfileRankMedal = memo(ProfileRankMedalInner);

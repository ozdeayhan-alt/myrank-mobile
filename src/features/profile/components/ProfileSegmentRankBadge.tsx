import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  getProfileSegmentBadgeHeight,
  getProfileSegmentBadgeWidth,
} from "../profileLayout";
import { useFullSegmentRank } from "../hooks/useFullSegmentRank";
import type { UserMetadata } from "../types";

const SEGMENT_RANK_DEFER_MS = 350;

const LOADING_COLOR = "#6b7280";
const HASH_COLOR = "#6b7280";
const HASH_OPACITY = 0.75;
const LABEL_COLOR = "#6b7280";
const INFO_COLOR = "#9ca3af";
const BADGE_FILL = "#ffffff";
const BADGE_STROKE = "#e5e7eb";

/** Üstü hafif yuvarlatılmış, tabanı geniş üçgen */
function softTriangleUpPath(width: number, height: number): string {
  const w = width;
  const h = height;

  return [
    `M ${w * 0.02} ${h * 0.94}`,
    `L ${w * 0.96} ${h * 0.94}`,
    `Q ${w * 0.98} ${h * 0.94} ${w * 0.975} ${h * 0.915}`,
    `L ${w * 0.53} ${h * 0.09}`,
    `Q ${w * 0.5} ${h * 0.04} ${w * 0.47} ${h * 0.09}`,
    `L ${w * 0.025} ${h * 0.915}`,
    `Q ${w * 0.02} ${h * 0.94} ${w * 0.02} ${h * 0.94}`,
    "Z",
  ].join(" ");
}

type ProfileSegmentRankBadgeProps = {
  userId: string;
  metadata: UserMetadata;
  isOwnProfile: boolean;
};

function RankNumber({ rank }: { rank: number | null }) {
  if (rank === null) {
    return (
      <Text className="text-4xl font-bold tabular-nums text-gray-900">—</Text>
    );
  }

  return (
    <Text
      className="text-center text-[38px] font-bold leading-[42px] tabular-nums text-gray-900"
      style={{ letterSpacing: -0.5 }}
      numberOfLines={1}
    >
      <Text style={{ color: HASH_COLOR, opacity: HASH_OPACITY }}>#</Text>
      {rank}
    </Text>
  );
}

function ProfileSegmentRankBadgeInner({
  userId,
  metadata,
  isOwnProfile,
}: ProfileSegmentRankBadgeProps) {
  const { width: screenWidth } = useWindowDimensions();
  const badgeWidth = getProfileSegmentBadgeWidth(screenWidth);
  const badgeHeight = getProfileSegmentBadgeHeight(badgeWidth);

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

  const showInfo = () => {
    Alert.alert(
      "#1 ne demek?",
      "Benzer profile sahip kullanıcılar arasındaki sıralaman."
    );
  };

  return (
    <View
      className="items-center"
      style={{ width: badgeWidth, height: badgeHeight, marginTop: 4 }}
    >
      <Svg
        width={badgeWidth}
        height={badgeHeight}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <Path
          d={softTriangleUpPath(badgeWidth, badgeHeight)}
          fill={BADGE_FILL}
          stroke={BADGE_STROKE}
          strokeWidth={1.5}
        />
      </Svg>

      <View
        className="flex-1 items-center justify-end px-5"
        style={{ paddingBottom: 16 }}
      >
        {loading && rank === null ? (
          <View className="items-center justify-center pb-8">
            <ActivityIndicator color={LOADING_COLOR} />
          </View>
        ) : (
          <>
            <RankNumber rank={rank} />
            <View className="mt-1 flex-row items-center gap-0.5">
              <Text
                className="text-[10px] font-medium"
                style={{ color: LABEL_COLOR }}
                numberOfLines={1}
              >
                Segment sırası
              </Text>
              <Pressable
                onPress={showInfo}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Segment sırası açıklaması"
              >
                <Ionicons
                  name="information-circle-outline"
                  size={12}
                  color={INFO_COLOR}
                />
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

export const ProfileSegmentRankBadge = memo(ProfileSegmentRankBadgeInner);

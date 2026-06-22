import { Ionicons } from "@expo/vector-icons";
import { memo, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRankingLadder } from "../hooks/useRankingLadder";
import { useFullSegmentRank } from "../hooks/useFullSegmentRank";
import { getProfileSegmentGaugeLayout } from "../profileLayout";
import type { UserMetadata } from "../types";
import { useProfileVoteContext } from "./ProfileVoteProvider";
import { ProfileTotalScoreGauge } from "./ProfileTotalScoreGauge";

const SEGMENT_RANK_DEFER_MS = 350;

const LOADING_COLOR = "#6b7280";
const HASH_COLOR = "#6b7280";
const HASH_OPACITY = 0.75;
const LABEL_COLOR = "#6b7280";
const INFO_COLOR = "#9ca3af";

type ProfileSegmentScoreBadgeProps = {
  userId: string;
  metadata: UserMetadata;
  isOwnProfile: boolean;
};

function RankNumber({
  rank,
  fontSize,
  lineHeight,
}: {
  rank: number | null;
  fontSize: number;
  lineHeight: number;
}) {
  if (rank === null) {
    return (
      <Text
        className="font-bold tabular-nums text-gray-900"
        style={{ fontSize, lineHeight }}
      >
        —
      </Text>
    );
  }

  return (
    <Text
      className="text-center font-bold tabular-nums text-gray-900"
      style={{ fontSize, lineHeight, letterSpacing: -0.5 }}
      numberOfLines={1}
    >
      <Text style={{ color: HASH_COLOR, opacity: HASH_OPACITY }}>#</Text>
      {rank}
    </Text>
  );
}

function ProfileSegmentScoreBadgeInner({
  userId,
  metadata,
  isOwnProfile,
}: ProfileSegmentScoreBadgeProps) {
  const { width: screenWidth, fontScale } = useWindowDimensions();
  const layout = useMemo(
    () => getProfileSegmentGaugeLayout(screenWidth, fontScale),
    [screenWidth, fontScale]
  );

  const { displayTP, voteFlash, gaugeVoteMode } = useProfileVoteContext();
  const { snapshotScore, aheadRungs, behindRungs, loading, ready, requestFullLadder } =
    useRankingLadder(userId);

  const [segmentRankEnabled, setSegmentRankEnabled] = useState(false);

  useEffect(() => {
    setSegmentRankEnabled(false);
    const timer = setTimeout(
      () => setSegmentRankEnabled(true),
      SEGMENT_RANK_DEFER_MS
    );
    return () => clearTimeout(timer);
  }, [userId]);

  useEffect(() => {
    if (voteFlash) {
      requestFullLadder();
    }
  }, [voteFlash, requestFullLadder]);

  const { rank, loading: rankLoading } = useFullSegmentRank(
    userId,
    metadata,
    isOwnProfile,
    segmentRankEnabled
  );

  const showSegmentInfo = () => {
    Alert.alert(
      "#1 ne demek?",
      "Benzer profile sahip kullanıcılar arasındaki sıralaman."
    );
  };

  const rankSlot =
    rankLoading && rank === null ? (
      <ActivityIndicator color={LOADING_COLOR} />
    ) : (
      <RankNumber
        rank={rank}
        fontSize={layout.rankFontSize}
        lineHeight={layout.rankLineHeight}
      />
    );

  const segmentLabelSlot = (
    <View className="flex-row items-center gap-0.5">
      <Text
        className="font-medium"
        style={{ color: LABEL_COLOR, fontSize: layout.labelFontSize }}
        numberOfLines={1}
      >
        Segment sırası
      </Text>
      <Pressable
        onPress={showSegmentInfo}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Segment sırası açıklaması"
      >
        <Ionicons
          name="information-circle-outline"
          size={layout.infoIconSize}
          color={INFO_COLOR}
        />
      </Pressable>
    </View>
  );

  return (
    <View
      className="items-center"
      style={{ width: layout.containerWidth, marginTop: 8 }}
      collapsable={false}
    >
      <ProfileTotalScoreGauge
        displayScore={displayTP}
        snapshotScore={snapshotScore}
        aheadRungs={aheadRungs}
        behindRungs={behindRungs}
        layout={layout}
        variant="embedded"
        middleSlot={rankSlot}
        footerSlot={segmentLabelSlot}
        loadingTarget={loading}
        snapshotReady={ready}
        voteFlash={voteFlash}
        gaugeVoteMode={gaugeVoteMode}
      />
    </View>
  );
}

export const ProfileSegmentScoreBadge = memo(ProfileSegmentScoreBadgeInner);

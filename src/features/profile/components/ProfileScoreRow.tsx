import { memo, useEffect, useState } from "react";
import { View } from "react-native";
import type { UserMetadata } from "../types";
import { useFullSegmentRank } from "../hooks/useFullSegmentRank";
import { ProfileSegmentRankDisplay } from "./ProfileSegmentRankDisplay";
import { PROFILE_METRIC_CARD_MIN_HEIGHT } from "@/components/ProfileMetricCard";
import { ProfileTotalScoreDisplay } from "./ProfileTotalScoreDisplay";
import { useProfileVoteContext } from "./ProfileVoteProvider";

const SEGMENT_RANK_DEFER_MS = 350;

type ProfileScoreRowProps = {
  userId: string;
  metadata: UserMetadata;
  isOwnProfile: boolean;
};

function ProfileScoreRowInner({
  userId,
  metadata,
  isOwnProfile,
}: ProfileScoreRowProps) {
  const { displayTP, voteFlash, gaugeVoteMode } = useProfileVoteContext();
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

  return (
    <View
      className="mb-4 flex-row items-stretch gap-3"
      style={{ minHeight: PROFILE_METRIC_CARD_MIN_HEIGHT }}
      collapsable={false}
    >
      <View
        className="flex-1"
        style={{ minHeight: PROFILE_METRIC_CARD_MIN_HEIGHT }}
        collapsable={false}
      >
        <ProfileTotalScoreDisplay
          displayScore={displayTP}
          userId={userId}
          compact
          voteFlash={voteFlash}
          gaugeVoteMode={gaugeVoteMode}
        />
      </View>
      <View
        className="flex-1"
        style={{ minHeight: PROFILE_METRIC_CARD_MIN_HEIGHT }}
        collapsable={false}
      >
        <ProfileSegmentRankDisplay rank={rank} loading={loading} />
      </View>
    </View>
  );
}

export const ProfileScoreRow = memo(ProfileScoreRowInner);

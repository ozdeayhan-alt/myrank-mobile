import { memo, useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import { PROFILE_METRIC_CARD_MIN_HEIGHT } from "@/components/ProfileMetricCard";
import { useRankingLadder } from "../hooks/useRankingLadder";
import { getProfileSegmentGaugeLayout } from "../profileLayout";
import type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";
import type { VoteFlashDirection } from "./ProfileVoteProvider";
import type { UserMetadata } from "../types";
import { EMPTY_METADATA } from "../types";
import { ProfileTotalScoreGauge } from "./ProfileTotalScoreGauge";

type ProfileTotalScoreDisplayProps = {
  /** Ortadaki anlık TP */
  displayScore: number;
  userId?: string;
  metadata?: UserMetadata;
  rankingsReady?: boolean;
  compact?: boolean;
  voteFlash?: VoteFlashDirection;
  gaugeVoteMode?: GaugeVoteMode;
  fullLadderEnabled?: boolean;
};

function ProfileTotalScoreDisplayInner({
  displayScore,
  userId,
  metadata = EMPTY_METADATA,
  rankingsReady = false,
  compact = false,
  voteFlash = null,
  gaugeVoteMode = null,
  fullLadderEnabled = false,
}: ProfileTotalScoreDisplayProps) {
  const { width: screenWidth, fontScale } = useWindowDimensions();
  const layout = useMemo(
    () => getProfileSegmentGaugeLayout(screenWidth, fontScale),
    [screenWidth, fontScale]
  );

  const { snapshotScore, aheadRungs, behindRungs, labelLoading, pointsLoading, ready, labelCategory, gaugeOfficialRank, atPinnacle, atGlobalLast } =
    useRankingLadder(userId, metadata, {
      rankingsReady,
      displayScore,
      gaugeVoteMode,
      fullLadderEnabled,
    });

  return (
    <View
      className={compact ? "flex-1" : "mb-6"}
      style={compact ? { minHeight: PROFILE_METRIC_CARD_MIN_HEIGHT } : undefined}
      collapsable={false}
    >
      <ProfileTotalScoreGauge
        displayScore={displayScore}
        snapshotScore={snapshotScore}
        aheadRungs={aheadRungs}
        behindRungs={behindRungs}
        layout={layout}
        variant="card"
        labelLoading={labelLoading}
        pointsLoading={pointsLoading}
        snapshotReady={ready}
        voteFlash={voteFlash}
        gaugeVoteMode={gaugeVoteMode}
        metadata={metadata}
        labelCategory={labelCategory}
        gaugeOfficialRank={gaugeOfficialRank}
        atPinnacle={atPinnacle}
        atGlobalLast={atGlobalLast}
      />
    </View>
  );
}

export const ProfileTotalScoreDisplay = memo(ProfileTotalScoreDisplayInner);

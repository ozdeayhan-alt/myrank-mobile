import { memo, useEffect } from "react";
import { View } from "react-native";
import { PROFILE_METRIC_CARD_MIN_HEIGHT } from "@/components/ProfileMetricCard";
import { useRankingLadder } from "../hooks/useRankingLadder";
import type { GaugeVoteMode } from "../lib/gaugeVoteModeStorage";
import type { VoteFlashDirection } from "./ProfileVoteProvider";
import { ProfileTotalScoreGauge } from "./ProfileTotalScoreGauge";

type ProfileTotalScoreDisplayProps = {
  /** Ortadaki anlık TP */
  displayScore: number;
  userId?: string;
  compact?: boolean;
  voteFlash?: VoteFlashDirection;
  gaugeVoteMode?: GaugeVoteMode;
};

function ProfileTotalScoreDisplayInner({
  displayScore,
  userId,
  compact = false,
  voteFlash = null,
  gaugeVoteMode = null,
}: ProfileTotalScoreDisplayProps) {
  const { snapshotScore, aheadRungs, behindRungs, loading, ready, requestFullLadder } =
    useRankingLadder(userId);

  useEffect(() => {
    if (voteFlash) {
      requestFullLadder();
    }
  }, [voteFlash, requestFullLadder]);

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
        loadingTarget={loading}
        snapshotReady={ready}
        voteFlash={voteFlash}
        gaugeVoteMode={gaugeVoteMode}
      />
    </View>
  );
}

export const ProfileTotalScoreDisplay = memo(ProfileTotalScoreDisplayInner);

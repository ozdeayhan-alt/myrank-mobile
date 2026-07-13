import { memo, useMemo } from "react";
import { useWindowDimensions, View } from "react-native";
import { useRankingLadder } from "../hooks/useRankingLadder";
import { profileVoteDisplayKey } from "@/features/ranking/vote/voteDisplayStore";
import { useVoteDisplay } from "@/features/ranking/vote/useVoteDisplay";
import {
  getProfileSegmentGaugeLayout,
  PROFILE_SCORE_SECTION_MARGIN_TOP,
} from "../profileLayout";
import type { UserMetadata } from "../types";
import { EMPTY_METADATA } from "../types";
import { useProfileVoteActions, useProfileVoteDisplay } from "./ProfileVoteProvider";
import { ProfileTotalScoreGauge } from "./ProfileTotalScoreGauge";

type ProfileSegmentScoreBadgeProps = {
  userId: string;
  metadata?: UserMetadata;
  rankingsReady?: boolean;
};

function ProfileSegmentScoreBadgeInner({
  userId,
  metadata = EMPTY_METADATA,
  rankingsReady = false,
}: ProfileSegmentScoreBadgeProps) {
  const { width: screenWidth, fontScale } = useWindowDimensions();
  const layout = useMemo(
    () => getProfileSegmentGaugeLayout(screenWidth, fontScale),
    [screenWidth, fontScale]
  );

  const { voteFlash, gaugeVoteMode, fullLadderRequested } =
    useProfileVoteDisplay();
  const { initialTotalScore } = useProfileVoteActions();
  const currentScore = useVoteDisplay(
    profileVoteDisplayKey(userId),
    initialTotalScore
  );
  const { snapshotScore, aheadRungs, behindRungs, labelLoading, pointsLoading, ready, labelCategory, gaugeOfficialRank, atPinnacle, atGlobalLast } =
    useRankingLadder(userId, metadata, {
      rankingsReady,
      displayScore: currentScore,
      gaugeVoteMode,
      fullLadderEnabled: fullLadderRequested,
    });

  return (
    <View
      className="items-center"
      style={{ width: layout.containerWidth, marginTop: PROFILE_SCORE_SECTION_MARGIN_TOP }}
      collapsable={false}
    >
      <ProfileTotalScoreGauge
        userId={userId}
        initialTotalScore={initialTotalScore}
        snapshotScore={snapshotScore}
        aheadRungs={aheadRungs}
        behindRungs={behindRungs}
        layout={layout}
        variant="embedded"
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

export const ProfileSegmentScoreBadge = memo(ProfileSegmentScoreBadgeInner);

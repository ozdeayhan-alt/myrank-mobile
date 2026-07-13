import { memo } from "react";
import { View } from "react-native";
import { PROFILE_METRIC_CARD_MIN_HEIGHT } from "@/components/ProfileMetricCard";
import { PROFILE_SEGMENT_TO_SCORE_GAP } from "../profileLayout";
import { ProfileTotalScoreDisplay } from "./ProfileTotalScoreDisplay";
import { useProfileVoteActions, useProfileVoteDisplay } from "./ProfileVoteProvider";

type ProfileScoreRowProps = {
  userId: string;
};

function ProfileScoreRowInner({ userId }: ProfileScoreRowProps) {
  const { initialTotalScore } = useProfileVoteActions();
  const { voteFlash, gaugeVoteMode, fullLadderRequested } = useProfileVoteDisplay();

  return (
    <View
      className="mb-1"
      style={{
        minHeight: PROFILE_METRIC_CARD_MIN_HEIGHT,
        marginTop: PROFILE_SEGMENT_TO_SCORE_GAP - 16,
      }}
      collapsable={false}
    >
      <ProfileTotalScoreDisplay
        userId={userId}
        initialTotalScore={initialTotalScore}
        compact
        voteFlash={voteFlash}
        gaugeVoteMode={gaugeVoteMode}
        fullLadderEnabled={fullLadderRequested}
      />
    </View>
  );
}

export const ProfileScoreRow = memo(ProfileScoreRowInner);

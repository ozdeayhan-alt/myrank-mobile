import { memo } from "react";
import { View } from "react-native";
import { PROFILE_METRIC_CARD_MIN_HEIGHT } from "@/components/ProfileMetricCard";
import { PROFILE_SEGMENT_TO_SCORE_GAP } from "../profileLayout";
import { ProfileTotalScoreDisplay } from "./ProfileTotalScoreDisplay";
import { useProfileVoteContext } from "./ProfileVoteProvider";

type ProfileScoreRowProps = {
  userId: string;
};

function ProfileScoreRowInner({
  userId,
}: ProfileScoreRowProps) {
  const { displayTP, voteFlash, gaugeVoteMode } = useProfileVoteContext();

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
        displayScore={displayTP}
        userId={userId}
        compact
        voteFlash={voteFlash}
        gaugeVoteMode={gaugeVoteMode}
      />
    </View>
  );
}

export const ProfileScoreRow = memo(ProfileScoreRowInner);

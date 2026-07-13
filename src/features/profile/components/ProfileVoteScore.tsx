import { memo } from "react";
import { useProfileVoteActions, useProfileVoteDisplay } from "./ProfileVoteProvider";
import { ProfileTotalScoreDisplay } from "./ProfileTotalScoreDisplay";

function ProfileVoteScoreInner() {
  const { targetUserId, initialTotalScore } = useProfileVoteActions();
  const { voteFlash, gaugeVoteMode, fullLadderRequested } = useProfileVoteDisplay();
  return (
    <ProfileTotalScoreDisplay
      userId={targetUserId}
      initialTotalScore={initialTotalScore}
      voteFlash={voteFlash}
      gaugeVoteMode={gaugeVoteMode}
      fullLadderEnabled={fullLadderRequested}
    />
  );
}

export const ProfileVoteScore = memo(ProfileVoteScoreInner);

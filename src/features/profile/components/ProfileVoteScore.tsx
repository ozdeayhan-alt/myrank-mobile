import { memo } from "react";
import { useProfileVoteActions, useProfileVoteDisplay } from "./ProfileVoteProvider";
import { ProfileTotalScoreDisplay } from "./ProfileTotalScoreDisplay";

function ProfileVoteScoreInner() {
  const { targetUserId } = useProfileVoteActions();
  const { displayTP, voteFlash, gaugeVoteMode, fullLadderRequested } = useProfileVoteDisplay();
  return (
    <ProfileTotalScoreDisplay
      displayScore={displayTP}
      userId={targetUserId}
      voteFlash={voteFlash}
      gaugeVoteMode={gaugeVoteMode}
      fullLadderEnabled={fullLadderRequested}
    />
  );
}

export const ProfileVoteScore = memo(ProfileVoteScoreInner);

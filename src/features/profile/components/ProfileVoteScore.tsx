import { memo } from "react";
import { useProfileVoteContext } from "./ProfileVoteProvider";
import { ProfileTotalScoreDisplay } from "./ProfileTotalScoreDisplay";

function ProfileVoteScoreInner() {
  const { displayTP, targetUserId, voteFlash, gaugeVoteMode } =
    useProfileVoteContext();
  return (
    <ProfileTotalScoreDisplay
      displayScore={displayTP}
      userId={targetUserId}
      voteFlash={voteFlash}
      gaugeVoteMode={gaugeVoteMode}
    />
  );
}

export const ProfileVoteScore = memo(ProfileVoteScoreInner);

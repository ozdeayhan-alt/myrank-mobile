import { memo } from "react";
import { useProfileVoteContext } from "./ProfileVoteProvider";
import { ProfileVoteControls } from "./ProfileVoteControls";

function ProfileVoteButtonsInner() {
  const { votesEnabled, registerUp, registerDown } = useProfileVoteContext();
  return (
    <ProfileVoteControls
      enabled={votesEnabled}
      onUp={registerUp}
      onDown={registerDown}
    />
  );
}

export const ProfileVoteButtons = memo(ProfileVoteButtonsInner);

import { memo, type RefObject } from "react";
import { View, type View as RNView } from "react-native";
import { useProfileVoteActions } from "./ProfileVoteProvider";
import { ProfileVoteControls } from "./ProfileVoteControls";

type ProfileVoteButtonsProps = {
  voteRowRef?: RefObject<RNView | null>;
  onVoteRowLayout?: () => void;
};

function ProfileVoteButtonsInner({
  voteRowRef,
  onVoteRowLayout,
}: ProfileVoteButtonsProps) {
  const { votesEnabled, registerUp, registerDown } = useProfileVoteActions();
  return (
    <View ref={voteRowRef} collapsable={false} onLayout={onVoteRowLayout}>
      <ProfileVoteControls
        enabled={votesEnabled}
        onUp={registerUp}
        onDown={registerDown}
      />
    </View>
  );
}

export const ProfileVoteButtons = memo(ProfileVoteButtonsInner);

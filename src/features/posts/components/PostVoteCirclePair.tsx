import { memo } from "react";
import { View } from "react-native";
import { ProfileVoteCircleButton } from "@/features/profile/components/ProfileVoteCircleButton";

const FEED_VOTE_DIAMETER = 46;
const VOTE_GAP = 6;

type PostVoteCirclePairProps = {
  onUp: () => void;
  onDown: () => void;
  disabled?: boolean;
  voteDiameter?: number;
};

function PostVoteCirclePairInner({
  onUp,
  onDown,
  disabled = false,
  voteDiameter = FEED_VOTE_DIAMETER,
}: PostVoteCirclePairProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: VOTE_GAP,
      }}
    >
      <ProfileVoteCircleButton
        direction="down"
        onPress={onDown}
        disabled={disabled}
        diameter={voteDiameter}
        showLabel={false}
        accessibilityLabel="Alçalt, gönderi puanından 1 düşür"
      />
      <ProfileVoteCircleButton
        direction="up"
        onPress={onUp}
        disabled={disabled}
        diameter={voteDiameter}
        showLabel={false}
        accessibilityLabel="Yükselt, gönderi puanına 1 ekle"
      />
    </View>
  );
}

export const PostVoteCirclePair = memo(PostVoteCirclePairInner);

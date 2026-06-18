import { View } from "react-native";
import { ProfileVoteCircleButton } from "@/features/profile/components/ProfileVoteCircleButton";

const FEED_VOTE_DIAMETER = 44;
const REELS_VOTE_DIAMETER = 44;
const VOTE_GAP = 6;

type PostVoteCirclePairProps = {
  onUp: () => void;
  onDown: () => void;
  disabled?: boolean;
  /** feed kartı | reels overlay */
  variant?: "feed" | "reels";
};

export function PostVoteCirclePair({
  onUp,
  onDown,
  disabled = false,
  variant = "feed",
}: PostVoteCirclePairProps) {
  const diameter = variant === "reels" ? REELS_VOTE_DIAMETER : FEED_VOTE_DIAMETER;
  const ghost = variant === "reels";

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
        diameter={diameter}
        showLabel={false}
        ghost={ghost}
        accessibilityLabel="Alçalt, gönderi puanından 1 düşür"
      />
      <ProfileVoteCircleButton
        direction="up"
        onPress={onUp}
        disabled={disabled}
        diameter={diameter}
        showLabel={false}
        ghost={ghost}
        accessibilityLabel="Yükselt, gönderi puanına 1 ekle"
      />
    </View>
  );
}

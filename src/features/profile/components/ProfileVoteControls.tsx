import { Text, View } from "react-native";
import { ProfileVoteCircleButton } from "./ProfileVoteCircleButton";
import { ProfileFollowButton } from "./ProfileFollowButton";
import { ProfileFollowStatsButton } from "./ProfileFollowStatsButton";
import { ProfileMessageButton } from "./ProfileMessageButton";
import { useProfileVoteContext } from "./ProfileVoteProvider";

const VOTE_DIAMETER = 72;
const SIDE_DIAMETER = 64;
const VOTE_GAP = 4;
const ROW_GAP = 10;

type ProfileVoteControlsProps = {
  enabled: boolean;
  onUp: () => void;
  onDown: () => void;
};

export function ProfileVoteControls({
  enabled,
  onUp,
  onDown,
}: ProfileVoteControlsProps) {
  const { isOwnProfile } = useProfileVoteContext();

  return (
    <View className="mb-4 w-full pt-2" collapsable={false}>
      {!enabled ? (
        <Text className="mb-3 text-center text-xs text-gray-500">
          Oy kullanmak ve takip etmek için giriş yapın.
        </Text>
      ) : null}

      <View
        className="w-full flex-row items-end justify-center"
        style={{ gap: ROW_GAP, paddingVertical: 4 }}
        collapsable={false}
      >
        <ProfileMessageButton diameter={SIDE_DIAMETER} />

        <View
          className="flex-row items-end"
          style={{ gap: VOTE_GAP }}
          collapsable={false}
        >
          <ProfileVoteCircleButton
            direction="down"
            onPress={onDown}
            disabled={!enabled}
            diameter={VOTE_DIAMETER}
            accessibilityLabel="Alçalt, toplam puandan 1 düşür"
          />
          <ProfileVoteCircleButton
            direction="up"
            onPress={onUp}
            disabled={!enabled}
            diameter={VOTE_DIAMETER}
            accessibilityLabel="Yükselt, toplam puana 1 ekle"
          />
        </View>

        {isOwnProfile ? (
          <ProfileFollowStatsButton diameter={SIDE_DIAMETER} />
        ) : (
          <ProfileFollowButton diameter={SIDE_DIAMETER} />
        )}
      </View>
    </View>
  );
}

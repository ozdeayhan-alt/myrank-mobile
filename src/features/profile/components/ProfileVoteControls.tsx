import { Text, View } from "react-native";
import { ProfileVoteCircleButton } from "./ProfileVoteCircleButton";
import { ProfileFollowButton } from "./ProfileFollowButton";
import { ProfileFollowStatsButton } from "./ProfileFollowStatsButton";
import { ProfileMessageButton } from "./ProfileMessageButton";
import { PROFILE_VOTE_CENTER_NUDGE } from "../profileLayout";
import { useProfileVoteContext } from "./ProfileVoteProvider";

const VOTE_DIAMETER = 72;
const SIDE_DIAMETER = 64;
const VOTE_GAP = 4;
const ROW_MIN_HEIGHT = VOTE_DIAMETER + 6;

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
    <View className="mb-2 w-full" style={{ marginTop: 8 }} collapsable={false}>
      {!enabled ? (
        <Text className="mb-3 text-center text-xs text-gray-500">
          Oy kullanmak ve takip etmek için giriş yapın.
        </Text>
      ) : null}

      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "flex-end",
          minHeight: ROW_MIN_HEIGHT,
          paddingVertical: 4,
        }}
        collapsable={false}
      >
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          {isOwnProfile ? (
            <ProfileFollowStatsButton diameter={SIDE_DIAMETER} />
          ) : (
            <ProfileFollowButton diameter={SIDE_DIAMETER} />
          )}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: VOTE_GAP,
            marginLeft: PROFILE_VOTE_CENTER_NUDGE,
          }}
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

        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <ProfileMessageButton diameter={SIDE_DIAMETER} />
        </View>
      </View>
    </View>
  );
}

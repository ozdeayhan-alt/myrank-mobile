import { useMemo } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { getProfileVoteControlLayout } from "../profileLayout";
import { ProfileVoteCircleButton } from "./ProfileVoteCircleButton";
import { ProfileFollowButton } from "./ProfileFollowButton";
import { ProfileFollowStatsButton } from "./ProfileFollowStatsButton";
import { ProfileMessageButton } from "./ProfileMessageButton";
import { useProfileVoteContext } from "./ProfileVoteProvider";

type ProfileVoteControlsProps = {
  enabled: boolean;
  onUp: () => void;
  onDown: () => void;
};

function ProfileSideButton({
  isOwnProfile,
  diameter,
}: {
  isOwnProfile: boolean;
  diameter: number;
}) {
  if (isOwnProfile) {
    return <ProfileFollowStatsButton diameter={diameter} />;
  }

  return <ProfileFollowButton diameter={diameter} />;
}

export function ProfileVoteControls({
  enabled,
  onUp,
  onDown,
}: ProfileVoteControlsProps) {
  const { isOwnProfile } = useProfileVoteContext();
  const { width: screenWidth } = useWindowDimensions();

  const layout = useMemo(
    () => getProfileVoteControlLayout(screenWidth),
    [screenWidth]
  );

  const voteButtons = (
    <>
      <ProfileVoteCircleButton
        direction="down"
        onPress={onDown}
        disabled={!enabled}
        diameter={layout.voteDiameter}
        accessibilityLabel="Alçalt, toplam puandan 1 düşür"
      />
      <ProfileVoteCircleButton
        direction="up"
        onPress={onUp}
        disabled={!enabled}
        diameter={layout.voteDiameter}
        accessibilityLabel="Yükselt, toplam puana 1 ekle"
      />
    </>
  );

  return (
    <View className="mb-4 w-full" style={{ marginTop: 8 }} collapsable={false}>
      {!enabled ? (
        <Text className="mb-3 text-center text-xs text-gray-500">
          Oy kullanmak ve takip etmek için giriş yapın.
        </Text>
      ) : null}

      {layout.stacked ? (
        <View collapsable={false}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: layout.voteGap,
              minHeight: layout.voteDiameter + 6,
              paddingVertical: 4,
            }}
          >
            {voteButtons}
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              minHeight: layout.sideDiameter + 6,
              marginTop: 8,
              paddingVertical: 4,
            }}
          >
            <ProfileSideButton
              isOwnProfile={isOwnProfile}
              diameter={layout.sideDiameter}
            />
            <ProfileMessageButton diameter={layout.sideDiameter} />
          </View>
        </View>
      ) : (
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "flex-end",
            minHeight: layout.rowMinHeight,
            paddingVertical: 4,
          }}
          collapsable={false}
        >
          <View
            style={{
              flex: 1,
              minWidth: layout.sideDiameter,
              alignItems: "flex-start",
            }}
          >
            <ProfileSideButton
              isOwnProfile={isOwnProfile}
              diameter={layout.sideDiameter}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              gap: layout.voteGap,
              marginLeft: layout.centerNudge,
              flexShrink: 0,
            }}
            collapsable={false}
          >
            {voteButtons}
          </View>

          <View
            style={{
              flex: 1,
              minWidth: layout.sideDiameter,
              alignItems: "flex-end",
            }}
          >
            <ProfileMessageButton diameter={layout.sideDiameter} />
          </View>
        </View>
      )}
    </View>
  );
}

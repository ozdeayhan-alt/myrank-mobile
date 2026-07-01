import { Pressable, Text, View, type ViewStyle } from "react-native";

const BADGE_SIZE = 20;

type StoryAddBadgeProps = {
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function StoryAddBadge({
  onPress,
  style,
  accessibilityLabel = "Story paylaş",
}: StoryAddBadgeProps) {
  const badge = (
    <View
      style={[
        {
          width: BADGE_SIZE,
          height: BADGE_SIZE,
          borderRadius: BADGE_SIZE / 2,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 2,
          borderColor: "#FFFFFF",
          backgroundColor: "#111827",
        },
        style,
      ]}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: "700",
          lineHeight: 16,
          marginTop: -1,
        }}
      >
        +
      </Text>
    </View>
  );

  if (!onPress) {
    return badge;
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        position: "absolute",
        bottom: -6,
        left: "50%",
        marginLeft: -BADGE_SIZE / 2,
        zIndex: 2,
      }}
    >
      {badge}
    </Pressable>
  );
}

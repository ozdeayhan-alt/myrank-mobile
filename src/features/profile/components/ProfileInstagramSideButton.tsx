import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { PROFILE_VOTE_BUTTON_LABEL_RESERVE } from "../profileLayout";

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

type ProfileInstagramSideButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel: string;
  height: number;
  maxWidth: number;
  fontSize: number;
  /** Yükselt/Alçalt daire çapı — dikey hizalama için */
  voteDiameter?: number;
  fill: string;
  foreground: string;
  borderColor?: string;
  borderWidth?: number;
  wrapperStyle?: StyleProp<ViewStyle>;
};

export function ProfileInstagramSideButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
  height,
  maxWidth,
  fontSize,
  voteDiameter,
  fill,
  foreground,
  borderColor = "#DBDBDB",
  borderWidth = 0,
  wrapperStyle,
}: ProfileInstagramSideButtonProps) {
  const verticalPad =
    voteDiameter != null ? Math.max(0, (voteDiameter - height) / 2) : 0;
  const bottomSpacer =
    voteDiameter != null
      ? verticalPad + PROFILE_VOTE_BUTTON_LABEL_RESERVE
      : PROFILE_VOTE_BUTTON_LABEL_RESERVE;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        {
          width: maxWidth,
          minWidth: maxWidth,
          maxWidth,
          opacity: disabled ? 0.45 : 1,
          transform: [
            { scale: pressed && !disabled && !loading ? 0.98 : 1 },
            { translateY: pressed && !disabled && !loading ? 1 : 0 },
          ],
        },
        wrapperStyle,
      ]}
    >
      {verticalPad > 0 ? <View style={{ height: verticalPad }} /> : null}
      <View
        style={{
          height,
          width: maxWidth,
          minWidth: maxWidth,
          maxWidth,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 10,
          backgroundColor: fill,
          borderColor,
          borderWidth,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={foreground} />
        ) : (
          <Text
            style={{
              width: "100%",
              fontSize,
              fontWeight: "600",
              textAlign: "center",
              color: foreground,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.78}
            ellipsizeMode="tail"
          >
            {label}
          </Text>
        )}
      </View>
      <View style={{ height: bottomSpacer }} />
    </Pressable>
  );
}

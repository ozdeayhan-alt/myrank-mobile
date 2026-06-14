import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const DEFAULT_DIAMETER = 88;
const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

type VoteTheme = {
  gradient: readonly [string, string, string];
  rim: string;
  dropShadow: string;
};

const THEMES: Record<"up" | "down", VoteTheme> = {
  up: {
    gradient: ["#5b9bd5", "#2563eb", "#1e3a8a"],
    rim: "#1e40af",
    dropShadow: "#172554",
  },
  down: {
    gradient: ["#e57373", "#dc2626", "#991b1b"],
    rim: "#991b1b",
    dropShadow: "#450a0a",
  },
};

type ProfileVoteCircleButtonProps = {
  direction: "up" | "down";
  onPress: () => void;
  disabled: boolean;
  accessibilityLabel: string;
  diameter?: number;
};

function VoteChevron({
  direction,
  size,
}: {
  direction: "up" | "down";
  size: number;
}) {
  const pathUp =
    "M16 3 L27 20.5 Q28.5 24.5 24.5 24.5 L7.5 24.5 Q3.5 24.5 5 20.5 Z";
  const pathDown =
    "M16 25 L27 7.5 Q28.5 3.5 24.5 3.5 L7.5 3.5 Q3.5 3.5 5 7.5 Z";

  const height = Math.round((size * 28) / 32);

  return (
    <Svg width={size} height={height} viewBox="0 0 32 28">
      <Path d={direction === "up" ? pathUp : pathDown} fill="#ffffff" />
    </Svg>
  );
}

function createStyles(size: number) {
  return StyleSheet.create({
    wrapper: {
      width: size,
      height: size + 6,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    dropShadow: {
      position: "absolute",
      bottom: 0,
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity: 0.35,
    },
    face: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2.5,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 6,
      elevation: 5,
    },
    content: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      paddingBottom: Math.max(6, Math.round(size * 0.1)),
    },
    iconWrap: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    gloss: {
      position: "absolute",
      top: 4,
      left: size * 0.14,
      right: size * 0.14,
      height: size * 0.36,
      borderBottomLeftRadius: size,
      borderBottomRightRadius: size,
      backgroundColor: "rgba(255,255,255,0.16)",
    },
    innerRim: {
      position: "absolute",
      bottom: 6,
      left: size * 0.18,
      right: size * 0.18,
      height: 2,
      borderRadius: 2,
      backgroundColor: "rgba(0,0,0,0.12)",
    },
    label: {
      fontSize: size >= 84 ? 10 : 9,
      fontWeight: "700",
      color: "#ffffff",
      letterSpacing: 0.15,
      textAlign: "center",
      alignSelf: "center",
      textShadowColor: "rgba(0,0,0,0.25)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
}

export function ProfileVoteCircleButton({
  direction,
  onPress,
  disabled,
  accessibilityLabel,
  diameter = DEFAULT_DIAMETER,
}: ProfileVoteCircleButtonProps) {
  const theme = THEMES[direction];
  const label = direction === "up" ? "Yükselt" : "Alçalt";
  const styles = useMemo(() => createStyles(diameter), [diameter]);
  const triangleSize = Math.round(diameter * 0.66);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.wrapper,
        {
          opacity: disabled ? 0.45 : 1,
          transform: [
            { scale: pressed && !disabled ? 0.94 : 1 },
            { translateY: pressed && !disabled ? 3 : 0 },
          ],
        },
      ]}
    >
      <View
        style={[styles.dropShadow, { backgroundColor: theme.dropShadow }]}
      />

      <LinearGradient
        colors={[...theme.gradient]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.face, { borderColor: theme.rim }]}
      >
        <View style={styles.gloss} />
        <View style={styles.innerRim} />

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <VoteChevron direction={direction} size={triangleSize} />
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

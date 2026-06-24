import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { PROFILE_VOTE_FLAT_COLORS } from "./profileFollowButtonTheme";

const DEFAULT_DIAMETER = 88;
const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

const FLAT_THEMES: Record<"up" | "down", { fill: string }> = {
  up: { fill: PROFILE_VOTE_FLAT_COLORS.up },
  down: { fill: PROFILE_VOTE_FLAT_COLORS.down },
};

type LegacyVoteTheme = {
  gradient: readonly [string, string, string];
  rim: string;
  dropShadow: string;
};

const GHOST_THEMES: Record<"up" | "down", LegacyVoteTheme> = {
  up: {
    gradient: [
      "rgba(91,155,213,0.28)",
      "rgba(37,99,235,0.32)",
      "rgba(30,58,138,0.36)",
    ],
    rim: "rgba(147,197,253,0.45)",
    dropShadow: "transparent",
  },
  down: {
    gradient: [
      "rgba(229,115,115,0.28)",
      "rgba(220,38,38,0.32)",
      "rgba(153,27,27,0.36)",
    ],
    rim: "rgba(252,165,165,0.45)",
    dropShadow: "transparent",
  },
};

type ProfileVoteCircleButtonProps = {
  direction: "up" | "down";
  onPress: () => void;
  disabled: boolean;
  accessibilityLabel: string;
  diameter?: number;
  /** Profil: Yükselt/Alçalt yazısı; gönderi: sadece ok */
  showLabel?: boolean;
  /** Reels overlay gibi yarı saydam yüzey (0–1) */
  visualOpacity?: number;
  /** Reels: saydam gradient, gölgesiz yüzey — flat stil uygulanmaz */
  ghost?: boolean;
};

function VoteChevron({
  direction,
  size,
  color = "#ffffff",
}: {
  direction: "up" | "down";
  size: number;
  color?: string;
}) {
  const pathUp =
    "M16 3 L27 20.5 Q28.5 24.5 24.5 24.5 L7.5 24.5 Q3.5 24.5 5 20.5 Z";
  const pathDown =
    "M16 25 L27 7.5 Q28.5 3.5 24.5 3.5 L7.5 3.5 Q3.5 3.5 5 7.5 Z";

  const height = Math.round((size * 28) / 32);

  return (
    <Svg width={size} height={height} viewBox="0 0 32 28">
      <Path d={direction === "up" ? pathUp : pathDown} fill={color} />
    </Svg>
  );
}

function createFlatStyles(size: number, showLabel: boolean) {
  return StyleSheet.create({
    wrapper: {
      width: size,
      height: showLabel ? size + 6 : size,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    face: {
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    content: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: showLabel ? "flex-end" : "center",
      paddingBottom: showLabel ? Math.max(6, Math.round(size * 0.1)) : 0,
    },
    iconWrap: {
      flex: showLabel ? 1 : undefined,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: size >= 84 ? 10 : 9,
      fontWeight: "600",
      color: "#ffffff",
      letterSpacing: 0.1,
      textAlign: "center",
      alignSelf: "center",
    },
  });
}

function createLegacyStyles(size: number, showLabel: boolean, ghost: boolean) {
  const borderWidth = size >= 64 ? 2.5 : ghost ? 1.5 : 2;

  return StyleSheet.create({
    wrapper: {
      width: size,
      height: showLabel ? size + 6 : size,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    dropShadow: {
      position: "absolute",
      bottom: 0,
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity: ghost ? 0 : 0.35,
    },
    face: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: ghost ? 0 : 4 },
      shadowOpacity: ghost ? 0 : 0.14,
      shadowRadius: ghost ? 0 : 6,
      elevation: ghost ? 0 : 5,
    },
    content: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: showLabel ? "flex-end" : "center",
      paddingBottom: showLabel ? Math.max(6, Math.round(size * 0.1)) : 0,
    },
    iconWrap: {
      flex: showLabel ? 1 : undefined,
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
      backgroundColor: ghost ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.16)",
    },
    innerRim: {
      position: "absolute",
      bottom: 6,
      left: size * 0.18,
      right: size * 0.18,
      height: 2,
      borderRadius: 2,
      backgroundColor: ghost ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.12)",
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
  showLabel = true,
  visualOpacity = 1,
  ghost = false,
}: ProfileVoteCircleButtonProps) {
  const label = direction === "up" ? "Yükselt" : "Alçalt";
  const flatStyles = useMemo(
    () => createFlatStyles(diameter, showLabel),
    [diameter, showLabel]
  );
  const legacyStyles = useMemo(
    () => createLegacyStyles(diameter, showLabel, ghost),
    [diameter, showLabel, ghost]
  );
  const triangleSize = Math.round(diameter * (showLabel ? 0.66 : 0.58));
  const idleOpacity = ghost ? Math.min(visualOpacity, 0.32) : visualOpacity;
  const disabledOpacity = disabled ? idleOpacity * 0.6 : idleOpacity;

  const pressableStyle = ({ pressed }: { pressed: boolean }) => [
    ghost ? legacyStyles.wrapper : flatStyles.wrapper,
    {
      opacity: disabled
        ? disabledOpacity
        : pressed
          ? Math.min(idleOpacity + 0.45, 0.9)
          : idleOpacity,
      transform: [
        { scale: pressed && !disabled ? 0.94 : 1 },
        { translateY: pressed && !disabled ? 3 : 0 },
      ],
    },
  ];

  if (ghost) {
    const theme = GHOST_THEMES[direction];

    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={pressableStyle}
      >
        <View
          style={[legacyStyles.dropShadow, { backgroundColor: theme.dropShadow }]}
        />

        <LinearGradient
          colors={[...theme.gradient]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[legacyStyles.face, { borderColor: theme.rim }]}
        >
          <View style={legacyStyles.gloss} />
          <View style={legacyStyles.innerRim} />

          <View style={legacyStyles.content}>
            <View style={legacyStyles.iconWrap}>
              <VoteChevron direction={direction} size={triangleSize} />
            </View>
            {showLabel ? <Text style={legacyStyles.label}>{label}</Text> : null}
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  const flatTheme = FLAT_THEMES[direction];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={pressableStyle}
    >
      <View style={[flatStyles.face, { backgroundColor: flatTheme.fill }]}>
        <View style={flatStyles.content}>
          <View style={flatStyles.iconWrap}>
            <VoteChevron direction={direction} size={triangleSize} />
          </View>
          {showLabel ? <Text style={flatStyles.label}>{label}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

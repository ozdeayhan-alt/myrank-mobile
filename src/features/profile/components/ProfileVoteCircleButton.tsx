import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { VoteChevron } from "@/components/VoteChevron";
import { FERRARI_RED, VOTE_UP_BLUE } from "./profileFollowButtonTheme";

const DEFAULT_DIAMETER = 54;
const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

const CHROME_GRADIENT = ["#E4E7EC", "#C5CAD3", "#A8B0BA"] as const;
const CHROME_GRADIENT_GHOST = [
  "rgba(228,231,236,0.55)",
  "rgba(197,202,211,0.45)",
  "rgba(154,163,174,0.4)",
] as const;

export type VoteCircleButtonTheme = {
  cap: readonly [string, string, string];
  capPressed: readonly [string, string, string];
  recess: string;
  recessPressed: string;
  icon: string;
  label: string;
  labelActive: string;
  activeGlow: string;
};

type ZikirmatikTheme = VoteCircleButtonTheme;

const ZIKIRMATIK_THEMES: Record<"up" | "down", ZikirmatikTheme> = {
  up: {
    cap: ["#6A9EE8", VOTE_UP_BLUE, "#0A52C8"],
    capPressed: ["#5A8FD8", "#0550D0", "#0848B0"],
    recess: "#1E2836",
    recessPressed: "#141A24",
    icon: "#FFFFFF",
    label: "#9CA3AF",
    labelActive: "#2563EB",
    activeGlow: "rgba(37,99,235,0.2)",
  },
  down: {
    cap: ["#E86A50", FERRARI_RED, "#C02818"],
    capPressed: ["#D85A40", "#D02000", "#A82010"],
    recess: "#2A1E20",
    recessPressed: "#1A1214",
    icon: "#FFFFFF",
    label: "#9CA3AF",
    labelActive: "#DC2626",
    activeGlow: "rgba(220,38,38,0.2)",
  },
};

type ProfileVoteCircleButtonProps = {
  direction: "up" | "down";
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled: boolean;
  accessibilityLabel: string;
  diameter?: number;
  /** Profil: Yükselt/Alçalt yazısı; gönderi: sadece ok */
  showLabel?: boolean;
  /** gaugeVoteMode ile eşleşince hafif vurgu */
  active?: boolean;
  /** Reels overlay gibi yarı saydam yüzey (0–1) */
  visualOpacity?: number;
  /** Reels: daha saydam metalik yüzey */
  ghost?: boolean;
  /** default | ghost | glass (Flow cam hissi) */
  surface?: "default" | "ghost" | "glass";
  /** Flow vb. özel renk teması */
  themeOverride?: VoteCircleButtonTheme;
  /** glass yüzey ayarları — yalnızca surface="glass" */
  glassConfig?: {
    visualOpacity?: number;
    blurIntensity?: number;
    blurTint?: "light" | "dark" | "default";
    androidBackdrop?: string;
    chromeRing?: readonly [string, string, string];
    ringBorder?: string;
    labelShadow?: string;
  };
};

function createStyles(size: number) {
  const ringWidth = Math.max(3, Math.round(size * 0.07));
  const recessInset = ringWidth + 1;
  const capSize = size - recessInset * 2;

  return StyleSheet.create({
    wrapper: {
      alignItems: "center",
      justifyContent: "flex-start",
      minWidth: size,
    },
    housing: {
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: Platform.OS === "android" ? 0 : 0.12,
      shadowRadius: 3,
      elevation: Platform.OS === "android" ? 2 : 0,
    },
    chromeRing: {
      width: size,
      height: size,
      borderRadius: size / 2,
      padding: ringWidth,
    },
    recess: {
      flex: 1,
      borderRadius: (size - ringWidth * 2) / 2,
      alignItems: "center",
      justifyContent: "center",
      padding: 2,
    },
    cap: {
      width: capSize,
      height: capSize,
      borderRadius: capSize / 2,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    capGloss: {
      position: "absolute",
      top: capSize * 0.06,
      left: capSize * 0.14,
      right: capSize * 0.14,
      height: capSize * 0.34,
      borderBottomLeftRadius: capSize,
      borderBottomRightRadius: capSize,
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    capShade: {
      position: "absolute",
      bottom: capSize * 0.08,
      left: capSize * 0.12,
      right: capSize * 0.12,
      height: capSize * 0.14,
      borderRadius: capSize,
      backgroundColor: "rgba(0,0,0,0.10)",
    },
    activeGlow: {
      position: "absolute",
      width: size + 6,
      height: size + 6,
      borderRadius: (size + 6) / 2,
      top: -3,
      left: -3,
    },
    label: {
      marginTop: 5,
      fontSize: 11,
      fontWeight: "600",
      textAlign: "center",
    },
    glassBackdrop: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: size / 2,
    },
    glassChromeRing: {
      borderWidth: StyleSheet.hairlineWidth,
    },
  });
}

export function ProfileVoteCircleButton({
  direction,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  accessibilityLabel,
  diameter = DEFAULT_DIAMETER,
  showLabel = true,
  active = false,
  visualOpacity = 1,
  ghost = false,
  surface,
  themeOverride,
  glassConfig,
}: ProfileVoteCircleButtonProps) {
  const label = direction === "up" ? "Yükselt" : "Alçalt";
  const resolvedSurface = surface ?? (ghost ? "ghost" : "default");
  const theme = themeOverride ?? ZIKIRMATIK_THEMES[direction];
  const styles = useMemo(() => createStyles(diameter), [diameter]);
  const triangleSize = Math.round(diameter * (showLabel ? 0.34 : 0.38));
  const isGlass = resolvedSurface === "glass";
  const isGhost = resolvedSurface === "ghost";
  const chromeColors = isGlass
    ? (glassConfig?.chromeRing ?? CHROME_GRADIENT_GHOST)
    : isGhost
      ? CHROME_GRADIENT_GHOST
      : CHROME_GRADIENT;
  const baseOpacity = isGlass
    ? Math.min(visualOpacity, glassConfig?.visualOpacity ?? 0.92)
    : isGhost
      ? Math.min(visualOpacity, 0.92)
      : visualOpacity;
  const disabledOpacity = disabled ? baseOpacity * 0.55 : baseOpacity;
  const glassBlurIntensity = glassConfig?.blurIntensity ?? 32;
  const glassBlurTint = glassConfig?.blurTint ?? "dark";
  const glassAndroidBackdrop =
    glassConfig?.androidBackdrop ?? "rgba(14,18,24,0.36)";
  const glassRingBorder = glassConfig?.ringBorder ?? "rgba(255,255,255,0.22)";
  const glassLabelShadow = glassConfig?.labelShadow ?? "rgba(0,0,0,0.55)";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.wrapper, { opacity: disabledOpacity }]}
    >
      {({ pressed }) => {
        const isPressed = pressed && !disabled;
        const capColors = isPressed ? theme.capPressed : theme.cap;

        return (
          <>
            <View style={styles.housing}>
              {active ? (
                <View
                  pointerEvents="none"
                  style={[
                    styles.activeGlow,
                    { backgroundColor: theme.activeGlow },
                  ]}
                />
              ) : null}

              {isGlass ? (
                Platform.OS === "ios" ? (
                  <BlurView
                    intensity={glassBlurIntensity}
                    tint={glassBlurTint}
                    style={styles.glassBackdrop}
                  />
                ) : (
                  <View
                    pointerEvents="none"
                    style={[
                      styles.glassBackdrop,
                      { backgroundColor: glassAndroidBackdrop },
                    ]}
                  />
                )
              ) : null}

              <LinearGradient
                colors={[...chromeColors]}
                locations={[0, 0.45, 1]}
                start={{ x: 0.15, y: 0 }}
                end={{ x: 0.85, y: 1 }}
                style={[
                  styles.chromeRing,
                  isGlass
                    ? [
                        styles.glassChromeRing,
                        { borderColor: glassRingBorder },
                      ]
                    : undefined,
                ]}
              >
                <View
                  style={[
                    styles.recess,
                    {
                      backgroundColor: isPressed
                        ? theme.recessPressed
                        : theme.recess,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.cap,
                      isPressed
                        ? {
                            transform: [
                              { translateY: Math.max(2, diameter * 0.045) },
                              { scale: 0.94 },
                            ],
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.35,
                            shadowRadius: 2,
                            elevation: 0,
                          }
                        : {
                            transform: [{ translateY: 0 }, { scale: 1 }],
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: Platform.OS === "android" ? 0 : 0.1,
                            shadowRadius: 2,
                            elevation: Platform.OS === "android" ? 1 : 0,
                          },
                    ]}
                  >
                    <LinearGradient
                      colors={[...capColors]}
                      locations={[0, 0.48, 1]}
                      start={{ x: 0.2, y: 0 }}
                      end={{ x: 0.8, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    {!isPressed ? <View style={styles.capGloss} /> : null}
                    <View
                      style={[
                        styles.capShade,
                        isPressed ? { opacity: 0.35 } : undefined,
                      ]}
                    />
                    <VoteChevron
                      direction={direction}
                      size={triangleSize}
                      color={theme.icon}
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>

            {showLabel ? (
              <Text
                style={[
                  styles.label,
                  { color: active ? theme.labelActive : theme.label },
                  isGlass
                    ? {
                        textShadowColor: glassLabelShadow,
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3,
                      }
                    : undefined,
                ]}
              >
                {label}
              </Text>
            ) : null}
          </>
        );
      }}
    </Pressable>
  );
}

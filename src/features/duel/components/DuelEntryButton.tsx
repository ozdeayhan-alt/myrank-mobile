import { LinearGradient } from "expo-linear-gradient";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import {
  FERRARI_RED,
  VOTE_UP_BLUE,
} from "@/features/profile/components/profileFollowButtonTheme";

const CHROME_GRADIENT = ["#E4E7EC", "#C5CAD3", "#A8B0BA"] as const;

const CAP_BY_TONE = {
  blue: {
    idle: ["#6A9EE8", VOTE_UP_BLUE, "#0A52C8"] as const,
    pressed: ["#5A8FD8", "#0550D0", "#0848B0"] as const,
  },
  /** Alçalt (Ferrari red) — result "Sonraki Düello". */
  red: {
    idle: ["#FF5A3C", FERRARI_RED, "#C41E00"] as const,
    pressed: ["#E84A2E", "#E02400", "#A81800"] as const,
  },
} as const;

const BUTTON_HEIGHT = 50;
const RING_WIDTH = 3;

export type DuelEntryButtonTone = keyof typeof CAP_BY_TONE;

type DuelEntryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Default blue (feed entry). Red = Alçalt / result CTA. */
  tone?: DuelEntryButtonTone;
  accessibilityLabel?: string;
  testID?: string;
};

export function DuelEntryButton({
  label,
  onPress,
  disabled = false,
  tone = "blue",
  accessibilityLabel,
  testID,
}: DuelEntryButtonProps) {
  const palette = CAP_BY_TONE[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={{ opacity: disabled ? 0.55 : 1 }}
    >
      {({ pressed }) => {
        const isPressed = pressed && !disabled;
        const capColors = isPressed ? palette.pressed : palette.idle;

        return (
          <View
            style={[
              styles.housing,
              Platform.OS === "android" ? { elevation: 2 } : undefined,
            ]}
          >
            <LinearGradient
              colors={[...CHROME_GRADIENT]}
              locations={[0, 0.45, 1]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={styles.chromeRing}
            >
              <View
                style={[
                  styles.recess,
                  { backgroundColor: isPressed ? "#141A24" : "#1E2836" },
                ]}
              >
                <View
                  style={[
                    styles.cap,
                    isPressed
                      ? {
                          transform: [{ translateY: 2 }, { scale: 0.97 }],
                        }
                      : undefined,
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
                  <View style={styles.capShade} />
                  <Text className="text-base font-semibold text-white">
                    {label}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        );
      }}
    </Pressable>
  );
}

const innerHeight = BUTTON_HEIGHT - RING_WIDTH * 2;
const capHeight = innerHeight - 4;

const styles = StyleSheet.create({
  housing: {
    borderRadius: BUTTON_HEIGHT / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === "android" ? 0 : 0.12,
    shadowRadius: 3,
  },
  chromeRing: {
    borderRadius: BUTTON_HEIGHT / 2,
    padding: RING_WIDTH,
  },
  recess: {
    borderRadius: innerHeight / 2,
    padding: 2,
  },
  cap: {
    height: capHeight,
    borderRadius: capHeight / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  capGloss: {
    position: "absolute",
    top: capHeight * 0.08,
    left: "12%",
    right: "12%",
    height: capHeight * 0.38,
    borderBottomLeftRadius: capHeight,
    borderBottomRightRadius: capHeight,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  capShade: {
    position: "absolute",
    bottom: capHeight * 0.1,
    left: "10%",
    right: "10%",
    height: capHeight * 0.16,
    borderRadius: capHeight,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});

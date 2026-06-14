import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DEFAULT_DIAMETER = 72;
const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

const THEME = {
  gradient: ["#5b9bd5", "#2563eb", "#1e3a8a"] as const,
  rim: "#1e40af",
  dropShadow: "#172554",
};

type ShareCircleButtonProps = {
  onPress: () => void;
  disabled: boolean;
  loading?: boolean;
  diameter?: number;
};

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
      fontSize: 10,
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

export function ShareCircleButton({
  onPress,
  disabled,
  loading = false,
  diameter = DEFAULT_DIAMETER,
}: ShareCircleButtonProps) {
  const styles = useMemo(() => createStyles(diameter), [diameter]);
  const iconSize = Math.round(diameter * 0.34);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel="Paylaş"
      style={({ pressed }) => [
        styles.wrapper,
        {
          opacity: isDisabled ? 0.45 : 1,
          transform: [
            { scale: pressed && !isDisabled ? 0.94 : 1 },
            { translateY: pressed && !isDisabled ? 3 : 0 },
          ],
        },
      ]}
    >
      <View
        style={[styles.dropShadow, { backgroundColor: THEME.dropShadow }]}
      />

      <LinearGradient
        colors={[...THEME.gradient]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.face, { borderColor: THEME.rim }]}
      >
        <View style={styles.gloss} />
        <View style={styles.innerRim} />

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="paper-plane" size={iconSize} color="#ffffff" />
            )}
          </View>
          <Text style={styles.label}>Paylaş</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

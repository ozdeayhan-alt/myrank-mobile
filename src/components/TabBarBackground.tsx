import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";

export function TabBarBackground() {
  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={48}
        tint="light"
        style={StyleSheet.absoluteFill}
      />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: "rgba(255, 255, 255, 0.72)",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: "rgba(229, 231, 235, 0.5)",
        },
      ]}
    />
  );
}

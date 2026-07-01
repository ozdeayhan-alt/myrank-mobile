import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { TopRanking } from "../types/achievement";

const GOLD_GRADIENT = ["#F5E6A3", "#D4AF37", "#B8962E"] as const;
const BRONZE_GRADIENT = ["#E8C9A0", "#CD7F32", "#A66B28"] as const;

type AchievementBadgeProps = {
  topRanking: TopRanking;
};

function AchievementBadgeInner({ topRanking }: AchievementBadgeProps) {
  const variant = topRanking.rank <= 3 ? "gold" : "bronze";
  const colors = variant === "gold" ? GOLD_GRADIENT : BRONZE_GRADIENT;
  const iconName = topRanking.rank === 1 ? "ribbon" : "trophy";

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={topRanking.label}
      style={styles.shadow}
    >
      <LinearGradient
        colors={[...colors]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.capsule}
      >
        <Ionicons name={iconName} size={14} color="#5C4813" />
        <Text style={styles.text} numberOfLines={1}>
          {topRanking.label}
        </Text>
      </LinearGradient>
    </View>
  );
}

export const AchievementBadge = memo(AchievementBadgeInner);

const styles = StyleSheet.create({
  shadow: {
    alignSelf: "center",
    shadowColor: "#B8962E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === "android" ? 0 : 0.22,
    shadowRadius: 4,
    elevation: 3,
  },
  capsule: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(92,72,19,0.22)",
    maxWidth: 280,
  },
  text: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#3D2E0A",
  },
});

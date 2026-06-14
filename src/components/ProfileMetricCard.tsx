import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import {
  PROFILE_ICON_THEMES,
  type ProfileIconTheme,
} from "@/features/profile/profileIconThemes";

export const PROFILE_METRIC_CARD_MIN_HEIGHT = 132;

type ProfileMetricCardProps = {
  label: string;
  value: ReactNode;
  icon: ComponentProps<typeof Ionicons>["name"];
  iconTheme: ProfileIconTheme;
  valueClassName?: string;
  loading?: boolean;
};

export function ProfileMetricCard({
  label,
  value,
  icon,
  iconTheme,
  valueClassName = "text-gray-900",
  loading = false,
}: ProfileMetricCardProps) {
  const theme = PROFILE_ICON_THEMES[iconTheme];

  return (
    <View
      className="w-full flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white px-3 py-4 shadow-sm"
      style={[
        { minHeight: PROFILE_METRIC_CARD_MIN_HEIGHT },
        Platform.OS === "android" ? { elevation: 2 } : undefined,
      ]}
    >
      <View
        className="mb-2 h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.iconBg }}
      >
        <Ionicons name={icon} size={16} color={theme.iconColor} />
      </View>
      <Text
        className="mb-2 min-h-[40px] text-center text-sm font-medium leading-5 text-gray-500"
        numberOfLines={2}
      >
        {label}
      </Text>

      <View className="min-h-[36px] items-center justify-center">
        {loading ? (
          <ActivityIndicator color="#374151" />
        ) : typeof value === "string" || typeof value === "number" ? (
          <Text
            className={`text-center text-3xl font-bold tabular-nums ${valueClassName}`}
            numberOfLines={1}
          >
            {value}
          </Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}

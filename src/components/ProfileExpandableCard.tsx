import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import {
  PROFILE_ICON_THEMES,
  type ProfileIconTheme,
} from "@/features/profile/profileIconThemes";

type ProfileExpandableCardProps = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  icon: ComponentProps<typeof Ionicons>["name"];
  iconTheme: ProfileIconTheme;
  accessibilityLabel: string;
  trailing?: ReactNode;
  children?: ReactNode;
};

export function ProfileExpandableCard({
  title,
  expanded,
  onToggle,
  icon,
  iconTheme,
  accessibilityLabel,
  trailing,
  children,
}: ProfileExpandableCardProps) {
  const theme = PROFILE_ICON_THEMES[iconTheme];

  return (
    <View className="mb-4">
      <View
        className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-3 shadow-sm"
        style={Platform.OS === "android" ? { elevation: 2 } : undefined}
      >
        <Pressable
          className="min-h-[44px] flex-1 flex-row items-center py-1 pr-2"
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ expanded }}
        >
          <View
            className="mr-3 h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.iconBg }}
          >
            <Ionicons name={icon} size={18} color={theme.iconColor} />
          </View>
          <Text className="flex-1 text-base font-semibold text-gray-900">
            {title}
          </Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6b7280"
          />
        </Pressable>
        {trailing}
      </View>

      {expanded && children ? (
        <View className="mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {children}
        </View>
      ) : null}
    </View>
  );
}

import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { PROFILE_HORIZONTAL_PADDING } from "@/features/profile/profileLayout";
import { PROFILE_MUTED_ICON_COLOR } from "@/features/profile/profileIconThemes";

type ProfileExpandableCardProps = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  icon: ComponentProps<typeof Ionicons>["name"];
  accessibilityLabel: string;
  trailing?: ReactNode;
  children?: ReactNode;
};

export function ProfileExpandableCard({
  title,
  expanded,
  onToggle,
  icon,
  accessibilityLabel,
  trailing,
  children,
}: ProfileExpandableCardProps) {
  return (
    <View
      className="mb-4"
      style={{ marginHorizontal: -PROFILE_HORIZONTAL_PADDING }}
    >
      <View
        className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm"
        style={Platform.OS === "android" ? { elevation: 2 } : undefined}
      >
        <Pressable
          className="min-h-[40px] flex-1 flex-row items-center py-0.5 pr-2"
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ expanded }}
        >
          <View className="mr-2.5 w-5 items-center">
            <Ionicons name={icon} size={20} color={PROFILE_MUTED_ICON_COLOR} />
          </View>
          <Text className="flex-1 text-sm font-semibold text-gray-900">
            {title}
          </Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#6b7280"
          />
        </Pressable>
        {trailing}
      </View>

      {expanded && children ? (
        <View className="mt-1.5 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {children}
        </View>
      ) : null}
    </View>
  );
}

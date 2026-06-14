import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/features/auth";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useNotificationsReadStore } from "@/features/notifications/store/useNotificationsReadStore";
import { countUnreadNotifications } from "@/features/notifications/utils/countUnreadNotifications";

export function NotificationBellButton() {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications } = useNotifications(user?.uid, { limit: 10 });
  const lastReadAt = useNotificationsReadStore((state) => state.lastReadAt);
  const hydrated = useNotificationsReadStore((state) => state.hydrated);
  const hydrate = useNotificationsReadStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const badgeCount = hydrated
    ? countUnreadNotifications(notifications, lastReadAt)
    : 0;

  return (
    <Pressable
      onPress={() => router.push("/notifications")}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Bildirimler"
      className="relative p-2"
    >
      <Ionicons name="notifications-outline" size={24} color="#374151" />
      {badgeCount > 0 ? (
        <View className="absolute right-1 top-1 min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1">
          <Text className="text-[10px] font-bold text-white">
            {badgeCount > 9 ? "9+" : badgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

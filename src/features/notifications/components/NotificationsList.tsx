import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useAuth } from "@/features/auth";
import { useNotifications } from "../hooks/useNotifications";
import type { AppNotification } from "../types";
import { formatNotificationLine } from "../utils/notificationTemplates";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import {
  canNavigateFromNotification,
  navigateFromNotification,
} from "../utils/navigateFromNotification";

function CommunitySafetyFooter() {
  const router = useRouter();

  return (
    <View className="border-t border-gray-100 px-4 py-5">
      <Text className="text-center text-xs leading-5 text-gray-500">
        Uygunsuz davranış gördüğünüzde profil veya gönderi menüsünden şikayet
        edebilirsiniz.{" "}
        <Text
          className="font-medium text-gray-700"
          onPress={() => router.push("/legal/moderation")}
        >
          Moderasyon politikası
        </Text>
      </Text>
    </View>
  );
}

type NotificationRowProps = {
  item: AppNotification;
  isLast: boolean;
  onPress: (item: AppNotification) => void;
};

function NotificationRow({ item, isLast, onPress }: NotificationRowProps) {
  const pressable = canNavigateFromNotification(item);
  const rowClassName = `px-4 py-3 ${
    isLast ? "" : "border-b border-gray-100"
  }`;

  const content = (
    <>
      <Text className="text-sm text-gray-900">
        {formatNotificationLine(item)}
      </Text>
      {item.createdAt ? (
        <Text className="mt-1 text-[10px] text-gray-400">
          {formatRelativeTime(item.createdAt)}
        </Text>
      ) : null}
    </>
  );

  if (!pressable) {
    return <View className={rowClassName}>{content}</View>;
  }

  return (
    <Pressable
      className={`${rowClassName} active:bg-gray-50`}
      onPress={() => onPress(item)}
      accessibilityRole="button"
    >
      {content}
    </Pressable>
  );
}

type NotificationsListProps = {
  limit?: number;
};

export function NotificationsList({ limit = 30 }: NotificationsListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications, loading, error, refresh } = useNotifications(
    user?.uid,
    { limit }
  );

  const handlePress = useCallback(
    (item: AppNotification) => {
      navigateFromNotification(item, router, user?.uid);
    },
    [router, user?.uid]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: AppNotification; index: number }) => (
      <NotificationRow
        item={item}
        isLast={index === notifications.length - 1}
        onPress={handlePress}
      />
    ),
    [handlePress, notifications.length]
  );

  const listFooter = useMemo(() => <CommunitySafetyFooter />, []);

  const listEmpty = useMemo(
    () => (
      <Text className="px-4 py-10 text-center text-sm text-gray-500">
        Henüz bildirim yok.
      </Text>
    ),
    []
  );

  if (loading) {
    return <ActivityIndicator className="my-10" color="#374151" />;
  }

  if (error) {
    return (
      <View className="px-4 py-8">
        <Text className="text-center text-sm text-red-600">{error}</Text>
        <Pressable className="mt-4 items-center" onPress={() => void refresh()}>
          <Text className="text-sm font-medium text-gray-700">Yeniden dene</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlashList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={listFooter}
      contentContainerStyle={{ paddingBottom: 8 }}
    />
  );
}

import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useNotifications } from "../hooks/useNotifications";
import { useGossipSpeech } from "../hooks/useGossipSpeech";
import type { AppNotification } from "../types";
import { formatNotificationLine } from "../utils/notificationTemplates";
import { formatRelativeTime } from "../utils/formatRelativeTime";
import {
  canNavigateFromNotification,
  navigateFromNotification,
} from "../utils/navigateFromNotification";
import { GossipWomanIcon } from "./GossipWomanIcon";
import { ProfileExpandableCard } from "@/components/ProfileExpandableCard";

type WhileYouWereAwaySectionProps = {
  userId: string;
  currentUserId?: string | null;
};

export function WhileYouWereAwaySection({
  userId,
  currentUserId = null,
}: WhileYouWereAwaySectionProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const { notifications, loading, error, refresh } = useNotifications(userId, {
    limit: 10,
    enabled: expanded,
  });
  const { speakGossip, speaking } = useGossipSpeech(notifications);

  const handleNotificationPress = useCallback(
    (item: AppNotification) => {
      navigateFromNotification(item, router, currentUserId ?? undefined);
    },
    [router, currentUserId]
  );

  const handleToggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      void refresh();
    }
  };

  return (
    <ProfileExpandableCard
      title="Sen yokken neler oldu?"
      expanded={expanded}
      onToggle={handleToggleExpand}
      icon="notifications-outline"
      iconTheme="message"
      accessibilityLabel="Sen yokken neler oldu listesini aç"
      trailing={
        expanded ? (
          <GossipWomanIcon onPress={() => void speakGossip()} speaking={speaking} />
        ) : null
      }
    >
      {!expanded ? null : (
        <>
          <Text className="border-b border-gray-50 px-4 py-3 text-center text-xs text-gray-500">
            Kadın ikona basınca son 10 olay sesli okunur.
          </Text>
          {loading ? (
            <ActivityIndicator className="my-6" color="#374151" />
          ) : error ? (
            <Text className="px-4 py-4 text-center text-sm text-red-600">
              {error}
            </Text>
          ) : notifications.length === 0 ? (
            <Text className="px-4 py-6 text-center text-sm text-gray-500">
              Henüz gıybet yok. Paylaşınca burada görünür.
            </Text>
          ) : (
            notifications.map((item, index) => {
              const pressable = canNavigateFromNotification(item);
              const rowClassName = `px-4 py-3 ${
                index < notifications.length - 1 ? "border-b border-gray-50" : ""
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
                return (
                  <View key={item.id} className={rowClassName}>
                    {content}
                  </View>
                );
              }

              return (
                <Pressable
                  key={item.id}
                  className={`${rowClassName} active:bg-gray-50`}
                  onPress={() => handleNotificationPress(item)}
                  accessibilityRole="button"
                  accessibilityLabel={formatNotificationLine(item)}
                >
                  {content}
                </Pressable>
              );
            })
          )}
        </>
      )}
    </ProfileExpandableCard>
  );
}

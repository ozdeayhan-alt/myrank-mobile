import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { NotificationsList } from "@/features/notifications/components/NotificationsList";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { useNotificationsReadStore } from "@/features/notifications/store/useNotificationsReadStore";

export default function NotificationsScreen() {
  const markAsRead = useNotificationsReadStore((state) => state.markAsRead);

  useFocusEffect(
    useCallback(() => {
      void markAsRead();
    }, [markAsRead])
  );

  return (
    <TabScreenSafeArea className="flex-1 bg-white">
      <NotificationsList limit={30} />
    </TabScreenSafeArea>
  );
}

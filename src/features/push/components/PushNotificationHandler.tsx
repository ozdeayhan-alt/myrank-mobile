import { useAuth } from "@/features/auth";
import { usePushNotifications } from "../hooks/usePushNotifications";

export function PushNotificationHandler() {
  const { user } = useAuth();
  usePushNotifications(user?.uid);
  return null;
}

import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export type NotificationPermissionResult = {
  granted: boolean;
  status: Notifications.PermissionStatus;
};

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "Bildirimler",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#111827",
    sound: "default",
    enableVibrate: true,
    showBadge: true,
  });
}

export { ensureAndroidChannel };

export async function requestNotificationPermissions(): Promise<NotificationPermissionResult> {
  if (!Device.isDevice) {
    return { granted: false, status: Notifications.PermissionStatus.UNDETERMINED };
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;

  if (existing.status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    status = requested.status;
  }

  if (status === "granted" && Platform.OS === "android") {
    await ensureAndroidChannel();
  }

  return {
    granted: status === "granted",
    status,
  };
}

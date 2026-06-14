import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { navigateFromNotification } from "@/features/notifications/utils/navigateFromNotification";
import { registerPushToken } from "../api/registerPushToken";
import { unregisterPushToken } from "../api/unregisterPushToken";
import { requestNotificationPermissions } from "../utils/requestNotificationPermissions";
import { devWarn } from "@/lib/devLog";
import { notificationFromPushData } from "../utils/parsePushNotificationData";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getExpoProjectId(): string | null {
  const fromExtra = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof fromExtra === "string" && fromExtra.trim()) {
    return fromExtra.trim();
  }

  const fromEas = Constants.easConfig?.projectId;
  if (typeof fromEas === "string" && fromEas.trim()) {
    return fromEas.trim();
  }

  return null;
}

async function resolveExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const projectId = getExpoProjectId();
  if (!projectId) {
    devWarn(
      "[push] EXPO_PUBLIC_EAS_PROJECT_ID eksik; push token alınamadı."
    );
    return null;
  }

  const { granted } = await requestNotificationPermissions();
  if (!granted) {
    return null;
  }

  const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenResult.data;
}

export function usePushNotifications(userId?: string) {
  const router = useRouter();
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const expoPushToken = await resolveExpoPushToken();
        if (!expoPushToken || cancelled) {
          return;
        }

        await registerPushToken(
          expoPushToken,
          Platform.OS === "ios" ? "ios" : "android"
        );
        registeredTokenRef.current = expoPushToken;
      } catch (error) {
        devWarn("[push] register failed", error);
      }
    })();

    return () => {
      cancelled = true;
      const token = registeredTokenRef.current;
      registeredTokenRef.current = null;
      if (token) {
        void unregisterPushToken(token).catch(() => {});
      }
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const handleResponse = (
      response: Notifications.NotificationResponse
    ) => {
      const data = response.notification.request.content.data;
      if (!data || typeof data !== "object") {
        return;
      }

      const notification = notificationFromPushData(
        data as Record<string, unknown>
      );
      if (!notification) {
        return;
      }

      navigateFromNotification(notification, router, userId);
    };

    const subscription =
      Notifications.addNotificationResponseReceivedListener(handleResponse);

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleResponse(response);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router, userId]);
}

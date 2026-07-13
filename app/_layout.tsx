import { GestureHandlerRootView } from "@/lib/gestureHandlerSetup";
import "../global.css";

import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import { ShareIntentProvider } from "expo-share-intent";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/features/auth";
import {
  initCrashReporting,
  setCrashUserId,
} from "@/lib/crashReporting";
import { CommentSheetHost } from "@/features/posts/components/CommentSheetHost";
import { PushNotificationHandler } from "@/features/push";
import { HomeFeedPrefetch } from "@/features/explore/components/HomeFeedPrefetch";
import { QueryProvider } from "@/providers/QueryProvider";
import { ShareIntentOrchestrator } from "@/features/share-intent/ShareIntentOrchestrator";
import {
  isMetadataComplete,
  useLoadProfile,
  useProfileStore,
} from "@/features/profile";

function CrashReportingBootstrap() {
  const { user } = useAuth();

  useEffect(() => {
    void initCrashReporting();
  }, []);

  useEffect(() => {
    setCrashUserId(user?.uid ?? null);
  }, [user?.uid]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const metadata = useProfileStore((s) => s.metadata);
  const isProfileBootstrapSettled = useProfileStore(
    (s) => s.isProfileBootstrapSettled
  );

  useLoadProfile(user?.uid, user?.displayName, user?.photoURL);

  const navigationReady = Boolean(navigationState?.key);
  const inAuthGroup = segments[0] === "(auth)";
  const inLegalGroup = segments[0] === "legal";
  const inProfileRoute =
    (segments[0] === "(tabs)" &&
      (segments.includes("profile") || segments.includes("user"))) ||
    segments[0] === "user";
  const metadataComplete = isMetadataComplete(metadata);
  const needsProfileCompletion =
    isProfileBootstrapSettled && !metadataComplete;

  const isBootstrapping = initializing || !navigationReady;

  useEffect(() => {
    if (isBootstrapping) return;

    if (!user && !inAuthGroup && !inLegalGroup) {
      router.replace("/(auth)/login");
      return;
    }

    if (user && inAuthGroup) {
      router.replace("/(tabs)");
      return;
    }

    if (user && needsProfileCompletion && !inProfileRoute) {
      router.replace("/(tabs)/profile");
    }
  }, [
    user,
    isBootstrapping,
    inAuthGroup,
    inLegalGroup,
    inProfileRoute,
    needsProfileCompletion,
    router,
  ]);

  if (isBootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#374151" />
      </View>
    );
  }

  if (inLegalGroup) {
    return <>{children}</>;
  }

  if (!user && !inAuthGroup && !inLegalGroup) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#374151" />
      </View>
    );
  }

  if (user && inAuthGroup) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#374151" />
      </View>
    );
  }

  if (user && !isProfileBootstrapSettled && !inLegalGroup) {
    return (
      <>
        <HomeFeedPrefetch />
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#374151" />
        </View>
      </>
    );
  }

  if (
    user &&
    isProfileBootstrapSettled &&
    needsProfileCompletion &&
    !inProfileRoute
  ) {
    return (
      <>
        <HomeFeedPrefetch />
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#374151" />
        </View>
      </>
    );
  }

  return (
    <>
      <CrashReportingBootstrap />
      <PushNotificationHandler />
      <HomeFeedPrefetch />
      <CommentSheetHost />
      {children}
    </>
  );
}

export default function RootLayout() {
  const router = useRouter();

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ShareIntentProvider
          options={{
            resetOnBackground: false,
            onResetShareIntent: () => {
              router.replace("/(tabs)");
            },
          }}
        >
          <QueryProvider>
            <AuthProvider>
              <ShareIntentOrchestrator />
              <ProtectedRoute>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="shareintent" options={{ headerShown: false }} />
                  <Stack.Screen name="(auth)" />
                <Stack.Screen name="legal" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="saved"
                  options={{
                    headerShown: true,
                    headerTitle: "",
                    headerBackTitle: "Geri",
                  }}
                />
                <Stack.Screen
                  name="post/[postId]"
                  options={{
                    headerShown: true,
                    headerTitle: "",
                    headerBackTitle: "Geri",
                  }}
                />
                <Stack.Screen
                  name="user/[userId]"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="messages"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="duel/index"
                  options={{
                    headerShown: false,
                    presentation: "fullScreenModal",
                    animation: "fade",
                  }}
                />
                <Stack.Screen
                  name="notifications"
                  options={{
                    headerShown: true,
                    headerTitle: "Bildirimler",
                    headerBackTitle: "Geri",
                  }}
                />
              </Stack>
            </ProtectedRoute>
          </AuthProvider>
        </QueryProvider>
        </ShareIntentProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/features/auth";
import { CommentSheetHost } from "@/features/posts/components/CommentSheetHost";
import { PushNotificationHandler } from "@/features/push";
import { QueryProvider } from "@/providers/QueryProvider";
import {
  isMetadataComplete,
  useLoadProfile,
  useProfileStore,
} from "@/features/profile";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const metadata = useProfileStore((s) => s.metadata);
  const isRemoteLoaded = useProfileStore((s) => s.isRemoteLoaded);

  useLoadProfile(user?.uid, user?.displayName, user?.photoURL);

  const navigationReady = Boolean(navigationState?.key);
  const inAuthGroup = segments[0] === "(auth)";
  const inLegalGroup = segments[0] === "legal";
  const inProfileRoute =
    (segments[0] === "(tabs)" && segments.includes("profile")) ||
    segments[0] === "user";
  const metadataComplete = isMetadataComplete(metadata);

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

    if (user && isRemoteLoaded && !metadataComplete && !inProfileRoute) {
      router.replace("/(tabs)/profile");
    }
  }, [
    user,
    isBootstrapping,
    inAuthGroup,
    inLegalGroup,
    inProfileRoute,
    isRemoteLoaded,
    metadataComplete,
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

  if (user && !isRemoteLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#374151" />
      </View>
    );
  }

  if (user && isRemoteLoaded && !metadataComplete && !inProfileRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#374151" />
      </View>
    );
  }

  return (
    <>
      <PushNotificationHandler />
      <CommentSheetHost />
      {children}
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryProvider>
          <AuthProvider>
            <ProtectedRoute>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
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
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

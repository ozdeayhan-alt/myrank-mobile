import { Redirect, useRootNavigationState } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/features/auth";

export default function Index() {
  const { user, initializing } = useAuth();
  const navigationState = useRootNavigationState();
  const navigationReady = Boolean(navigationState?.key);

  if (initializing || !navigationReady) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#374151" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

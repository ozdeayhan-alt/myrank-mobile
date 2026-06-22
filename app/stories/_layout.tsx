import { Stack } from "expo-router";

export default function StoriesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Geri",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen
        name="create"
        options={{ title: "", headerShown: false, presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="share-from-post"
        options={{ title: "", headerShown: false, presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="view"
        options={{ title: "", headerShown: false, presentation: "fullScreenModal" }}
      />
    </Stack>
  );
}

import { Stack } from "expo-router";

export default function AiStoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Geri",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="create" options={{ title: "AI Story Oluştur" }} />
      <Stack.Screen name="feed" options={{ title: "Story'ler" }} />
      <Stack.Screen
        name="view"
        options={{ title: "", headerShown: false, presentation: "fullScreenModal" }}
      />
    </Stack>
  );
}

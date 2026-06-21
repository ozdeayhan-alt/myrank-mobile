import { Stack } from "expo-router";

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Geri",
        headerTitleStyle: { fontWeight: "600" },
      }}
    >
      <Stack.Screen name="privacy" options={{ title: "Gizlilik Politikası" }} />
      <Stack.Screen name="terms" options={{ title: "Kullanım Koşulları" }} />
      <Stack.Screen
        name="moderation"
        options={{ title: "İçerik ve Moderasyon" }}
      />
      <Stack.Screen
        name="child-safety"
        options={{ title: "Çocuk Güvenliği Standartları" }}
      />
    </Stack>
  );
}

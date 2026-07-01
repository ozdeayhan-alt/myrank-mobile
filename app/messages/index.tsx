import { ActivityIndicator, RefreshControl, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { InboxRow } from "@/features/messages/components/InboxRow";
import { useInbox } from "@/features/messages/hooks/useInbox";
import type { InboxEntry } from "@/features/messages/types";
import { messageTheme } from "@/features/messages/theme";
import { SPINNER_COLOR } from "@/lib/uiClasses";

export default function MessagesInboxScreen() {
  const router = useRouter();
  const { entries, loading, error, refreshing, refresh } = useInbox();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: messageTheme.inboxBg }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Mesajlar",
          headerBackTitle: "Geri",
          headerStyle: { backgroundColor: messageTheme.rowBg },
          headerTitleStyle: { color: messageTheme.textPrimary },
        }}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={SPINNER_COLOR}
          className="mt-12"
        />
      ) : error ? (
        <View className="mx-4 mt-6 rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      ) : entries.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="chatbubbles-outline" size={48} color={messageTheme.textMuted} />
          <Text className="mt-4 text-center text-base font-semibold text-gray-900">
            Henüz mesaj yok
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-500">
            Bir profilde Mesaj butonuna basarak sohbet başlatabilirsiniz.
          </Text>
        </View>
      ) : (
        <FlashList
          data={entries}
          keyExtractor={(item: InboxEntry) => item.conversationId}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          renderItem={({ item }) => (
            <InboxRow
              entry={item}
              onPress={() =>
                router.push({
                  pathname: "/messages/[conversationId]",
                  params: {
                    conversationId: item.conversationId,
                    title: item.otherDisplayName,
                    photoURL: item.otherPhotoURL ?? "",
                  },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

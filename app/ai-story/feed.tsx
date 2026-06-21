import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import {
  chipLabel,
  fetchAiStoriesFeed,
  MOOD_CHIPS,
  type AiStory,
} from "@/features/ai-story";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

export default function AiStoryFeedScreen() {
  const router = useRouter();
  const [stories, setStories] = useState<AiStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const next = await fetchAiStoriesFeed();
      setStories(next);
    } catch (error) {
      Alert.alert("Story feed", getUserFacingErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (loading) {
    return (
      <TabScreenSafeArea className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#374151" />
      </TabScreenSafeArea>
    );
  }

  return (
    <TabScreenSafeArea className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-4">
        <Text className="text-xl font-bold text-gray-900">Story'ler</Text>
        <Pressable
          onPress={() => router.push("/ai-story/create")}
          className="rounded-full bg-gray-900 px-4 py-2"
        >
          <Text className="text-sm font-semibold text-white">+ Yeni</Text>
        </Pressable>
      </View>

      <FlatList
        data={stories}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />
        }
        ListEmptyComponent={
          <View className="items-center px-5 py-16">
            <Text className="text-center text-gray-500">
              Henüz aktif story yok. İlk vibe story'ni oluştur.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            className="border-b border-gray-100 px-5 py-4"
            onPress={() =>
              router.push({
                pathname: "/ai-story/view",
                params: { storyId: item.id, startIndex: String(index) },
              })
            }
          >
            <Text className="text-base font-semibold text-gray-900">
              {item.authorDisplayName}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {chipLabel(MOOD_CHIPS, item.moodKey)}
              {item.caption ? ` · "${item.caption}"` : ""}
            </Text>
          </Pressable>
        )}
      />
    </TabScreenSafeArea>
  );
}

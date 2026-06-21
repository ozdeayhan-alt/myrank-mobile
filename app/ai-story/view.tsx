import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  fetchAiStoriesFeed,
  fetchAiStoryById,
  StoryViewer,
  type AiStory,
} from "@/features/ai-story";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

export default function AiStoryViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    storyId?: string;
    startIndex?: string;
  }>();
  const [stories, setStories] = useState<AiStory[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (params.storyId) {
        const [story, feed] = await Promise.all([
          fetchAiStoryById(params.storyId),
          fetchAiStoriesFeed(),
        ]);
        const merged = feed.some((item) => item.id === story.id)
          ? feed
          : [story, ...feed];
        setStories(merged);
        const parsedIndex = Number.parseInt(params.startIndex ?? "", 10);
        const index = merged.findIndex((item) => item.id === story.id);
        setInitialIndex(
          Number.isFinite(parsedIndex) && parsedIndex >= 0
            ? parsedIndex
            : Math.max(index, 0)
        );
        return;
      }

      const feed = await fetchAiStoriesFeed();
      setStories(feed);
      setInitialIndex(0);
    } catch (error) {
      Alert.alert("Story", getUserFacingErrorMessage(error));
      router.back();
    } finally {
      setLoading(false);
    }
  }, [params.startIndex, params.storyId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <StoryViewer
      stories={stories}
      initialIndex={initialIndex}
      onClose={() => router.back()}
    />
  );
}

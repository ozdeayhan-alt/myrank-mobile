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
    userId?: string;
  }>();
  const [stories, setStories] = useState<AiStory[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const feed = await fetchAiStoriesFeed();
      const scoped = params.userId
        ? feed
            .filter((item) => item.userId === params.userId)
            .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
        : feed;

      if (params.storyId) {
        const hasStory = scoped.some((item) => item.id === params.storyId);
        if (!hasStory) {
          const story = await fetchAiStoryById(params.storyId);
          if (!params.userId || story.userId === params.userId) {
            scoped.unshift(story);
          }
        }
        const index = scoped.findIndex((item) => item.id === params.storyId);
        setStories(scoped);
        setInitialIndex(Math.max(index, 0));
        return;
      }

      setStories(scoped);
      setInitialIndex(0);
    } catch (error) {
      Alert.alert("Story", getUserFacingErrorMessage(error));
      router.back();
    } finally {
      setLoading(false);
    }
  }, [params.startIndex, params.storyId, params.userId, router]);

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

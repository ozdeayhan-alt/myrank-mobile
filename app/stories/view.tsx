import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/features/auth";
import {
  fetchStoriesFeed,
  fetchStoryById,
  StoryViewer,
  type Story,
} from "@/features/stories";
import { resolveStoryRingPlaylist } from "@/features/stories/lib/buildStoryRingPlaylist";
import { markStorySeen } from "@/features/stories/lib/storySeenStorage";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

export default function StoryViewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    storyId?: string;
    userId?: string;
    scope?: "singleUser" | "ring";
  }>();
  const [stories, setStories] = useState<Story[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleStoryViewed = useCallback((storyId: string) => {
    void markStorySeen(storyId);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const feed = await fetchStoriesFeed();
      const { playlist, initialIndex: startIndex } =
        await resolveStoryRingPlaylist(feed, user?.uid ?? null, {
          storyId: params.storyId,
          userId: params.userId,
          scope: params.scope,
          fetchStoryById,
        });

      if (playlist.length === 0) {
        Alert.alert("Story", "Gösterilecek story yok.");
        router.back();
        return;
      }

      setStories(playlist);
      setInitialIndex(startIndex);
    } catch (error) {
      Alert.alert("Story", getUserFacingErrorMessage(error));
      router.back();
    } finally {
      setLoading(false);
    }
  }, [params.scope, params.storyId, params.userId, router, user?.uid]);

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
      key={`${initialIndex}-${stories.map((s) => s.id).join(",")}`}
      stories={stories}
      initialIndex={initialIndex}
      onClose={handleClose}
      onStoryViewed={handleStoryViewed}
    />
  );
}

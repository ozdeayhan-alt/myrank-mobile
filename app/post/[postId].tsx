import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/features/auth";
import { PostCard } from "@/features/posts";
import { PostInteractionProvider } from "@/features/posts/context/PostInteractionContext";
import { fetchPostById } from "@/features/posts/api/fetchPostById";
import type { Post } from "@/features/posts/types";
import { isVideoPost } from "@/features/posts/utils/filterPostsByContentType";
import { useRouter } from "expo-router";
import { isFlowPost } from "@/features/flow/utils/isFlowPost";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

export default function PostDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    fetchPostById(postId)
      .then((data) => {
        setPost(data);
        if (!data) {
          setError("Gönderi bulunamadı.");
        } else if (isVideoPost(data)) {
          setError("Video içerikleri geçici olarak kullanılamıyor.");
          setPost(null);
        } else if (isFlowPost(data)) {
          router.replace(`/flow/${data.id}`);
        }
      })
      .catch((err) => setError(getUserFacingErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [postId, router]);

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="px-4 py-4">
      {loading ? (
        <ActivityIndicator size="large" color="#374151" className="mt-8" />
      ) : error ? (
        <View className="rounded-xl bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-700">{error}</Text>
        </View>
      ) : post ? (
        <PostInteractionProvider currentUserId={user?.uid ?? null}>
          <PostCard post={post} currentUserId={user?.uid ?? null} />
        </PostInteractionProvider>
      ) : null}
    </ScrollView>
  );
}

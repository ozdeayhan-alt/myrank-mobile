import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/features/auth";
import { PostCard } from "@/features/posts";
import { PostInteractionProvider } from "@/features/posts/context/PostInteractionContext";
import { VideoReelsViewer } from "@/features/posts/components/VideoReelsViewer";
import { fetchPostById } from "@/features/posts/api/fetchPostById";
import type { Post } from "@/features/posts/types";
import { filterVideoPosts, isVideoPost } from "@/features/posts/utils/videoPosts";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

export default function PostDetailScreen() {
  const { user } = useAuth();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    fetchPostById(postId)
      .then((data) => {
        setPost(data);
        if (!data) setError("Gönderi bulunamadı.");
      })
      .catch((err) => setError(getUserFacingErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [postId]);

  const videoPosts = post ? filterVideoPosts([post]) : [];

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
          <PostCard
            post={post}
            currentUserId={user?.uid ?? null}
            onOpenVideo={
              isVideoPost(post) ? () => setVideoOpen(true) : undefined
            }
          />
          {videoOpen && videoPosts.length > 0 ? (
            <VideoReelsViewer
              visible
              videoPosts={videoPosts}
              initialPostId={post.id}
              onClose={() => setVideoOpen(false)}
            />
          ) : null}
        </PostInteractionProvider>
      ) : null}
    </ScrollView>
  );
}

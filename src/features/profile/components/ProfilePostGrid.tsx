import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { fetchPostsByAuthor } from "@/features/posts/api/fetchPostsByAuthor";
import type { Post } from "@/features/posts/types";
import { resolveMediaDisplayUrl, resolveVideoPosterUrl } from "@/lib/media/resolveMediaDisplayUrl";
import { getContentTypeLabel } from "@/features/posts/constants/contentTypeLabels";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

type ProfilePostGridProps = {
  authorId: string;
};

export function ProfilePostGrid({ authorId }: ProfilePostGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = 48;
  const cellSize = (screenWidth - horizontalPadding) / 3;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPostsByAuthor(authorId, 30);
      setPosts(data);
    } catch (err) {
      setError(getUserFacingErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [authorId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator color="#374151" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="rounded-xl bg-red-50 px-4 py-3">
        <Text className="text-sm text-red-700">{error}</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <Text className="py-4 text-center text-sm text-gray-500">
        Henüz gönderi yok.
      </Text>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={3}
      scrollEnabled={false}
      columnWrapperStyle={{ gap: 4 }}
      contentContainerStyle={{ gap: 4 }}
      renderItem={({ item }) => {
        const thumbUri =
          resolveVideoPosterUrl(item) ||
          resolveMediaDisplayUrl(item.mediaURL);
        return (
          <View
            style={{ width: cellSize, height: cellSize }}
            className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
          >
            {thumbUri ? (
              <Image
                source={{ uri: thumbUri }}
                style={{ width: cellSize, height: cellSize * 0.65 }}
                contentFit="cover"
                cachePolicy="memory-disk"
                recyclingKey={item.id}
              />
            ) : null}
            <View className="flex-1 p-2">
              <Text className="text-[10px] font-semibold text-gray-700">
                {item.postScore} puan
              </Text>
              <Text className="mt-1 text-[10px] text-gray-400">
                {getContentTypeLabel(item.contentType)}
              </Text>
              <Text
                className="mt-auto text-[10px] text-gray-600"
                numberOfLines={2}
              >
                {item.content ?? ""}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}

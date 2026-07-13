import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo, useMemo } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import type { Post } from "../types";

type WhispLinkCardProps = {
  post: Post;
};

function resolveOpenableUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function formatLinkHost(url: string): string {
  try {
    return new URL(resolveOpenableUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return "Bağlantı";
  }
}

function WhispLinkCardInner({ post }: WhispLinkCardProps) {
  const rawLinkUrl = post.linkUrl?.trim();
  if (!rawLinkUrl || post.contentType !== "tweet") {
    return null;
  }

  const linkUrl = resolveOpenableUrl(rawLinkUrl);
  const host = useMemo(() => formatLinkHost(linkUrl), [linkUrl]);
  const title = post.linkTitle?.trim() || host;
  const description = post.linkDescription?.trim();
  const imageUrl = post.linkImageUrl?.trim();

  return (
    <Pressable
      className="mx-4 mb-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
      onPress={() => {
        void Linking.openURL(linkUrl);
      }}
      accessibilityRole="link"
      accessibilityLabel={`Bağlantıyı aç: ${title}`}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-36 w-full bg-gray-200"
          contentFit="cover"
          recyclingKey={imageUrl}
        />
      ) : null}

      <View className="px-3 py-2.5">
        <View className="flex-row items-start gap-2">
          {!imageUrl ? (
            <Ionicons name="link-outline" size={16} color="#2563EB" />
          ) : null}
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
              {title}
            </Text>
            {description ? (
              <Text className="mt-1 text-xs text-gray-600" numberOfLines={2}>
                {description}
              </Text>
            ) : null}
            <Text className="mt-1 text-xs text-gray-500" numberOfLines={1}>
              {host}
            </Text>
          </View>
          <Ionicons name="open-outline" size={16} color="#9CA3AF" />
        </View>
      </View>
    </Pressable>
  );
}

export const WhispLinkCard = memo(WhispLinkCardInner);

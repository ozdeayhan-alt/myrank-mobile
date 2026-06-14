import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import type { PostContentType } from "../types";
import { ShareVideoPreview } from "./ShareVideoPreview";

type ShareComposerMediaSectionProps = {
  selected: PostContentType;
  mediaUri: string | null;
  submitting: boolean;
  onPickMedia: () => void;
};

export function ShareComposerMediaSection({
  selected,
  mediaUri,
  submitting,
  onPickMedia,
}: ShareComposerMediaSectionProps) {
  if (selected === "tweet") {
    return null;
  }

  return (
    <View className="mb-4">
      {mediaUri && selected === "image" ? (
        <View className="overflow-hidden rounded-2xl border border-gray-200">
          <Image
            source={{ uri: mediaUri }}
            style={{ width: "100%", height: 220 }}
            contentFit="cover"
          />
          <Pressable
            className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5"
            onPress={onPickMedia}
            disabled={submitting}
          >
            <Text className="text-xs font-semibold text-white">Değiştir</Text>
          </Pressable>
        </View>
      ) : null}

      {mediaUri && selected === "video" ? (
        <View className="overflow-hidden rounded-2xl border border-gray-200">
          <ShareVideoPreview uri={mediaUri} />
          <Pressable
            className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5"
            onPress={onPickMedia}
            disabled={submitting}
          >
            <Text className="text-xs font-semibold text-white">Değiştir</Text>
          </Pressable>
        </View>
      ) : null}

      {!mediaUri ? (
        <Pressable
          className="items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10"
          onPress={onPickMedia}
          disabled={submitting}
        >
          <Ionicons
            name={selected === "image" ? "image-outline" : "videocam-outline"}
            size={32}
            color="#9CA3AF"
          />
          <Text className="mt-3 text-sm font-semibold text-gray-700">
            Kamera veya galeri
          </Text>
          <Text className="mt-1 text-xs text-gray-500">
            {selected === "video"
              ? "En fazla 33 saniye · kamera veya galeri"
              : "JPG veya PNG · kamera veya galeri"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

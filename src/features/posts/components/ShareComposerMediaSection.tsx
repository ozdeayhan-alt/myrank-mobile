import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { FeedImagePreview } from "@/features/media/components/FeedImagePreview";
import type { PostContentType } from "../types";
import { ShareVideoPreview } from "./ShareVideoPreview";

type ShareComposerMediaSectionProps = {
  selected: PostContentType;
  mediaUri: string | null;
  submitting: boolean;
  onPickFromCamera: () => void;
  onPickFromGallery: () => void;
};

type MediaSourceCardsProps = {
  isImage: boolean;
  submitting: boolean;
  onPickFromCamera: () => void;
  onPickFromGallery: () => void;
};

function MediaSourceCards({
  isImage,
  submitting,
  onPickFromCamera,
  onPickFromGallery,
}: MediaSourceCardsProps) {
  return (
    <View className="flex-row gap-3">
      <Pressable
        className="flex-1 items-center rounded-2xl border border-gray-200 bg-white px-3 py-5 shadow-sm active:bg-gray-50"
        onPress={onPickFromCamera}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityLabel="Kamera"
      >
        <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Ionicons name="camera-outline" size={24} color="#111827" />
        </View>
        <Text className="text-sm font-semibold text-gray-900">Kamera</Text>
        <Text className="mt-1 text-center text-xs text-gray-500">
          {isImage ? "Anında çek" : "En fazla 33 sn"}
        </Text>
      </Pressable>

      <Pressable
        className="flex-1 items-center rounded-2xl border border-gray-200 bg-white px-3 py-5 shadow-sm active:bg-gray-50"
        onPress={onPickFromGallery}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityLabel="Galeri"
      >
        <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Ionicons name="images-outline" size={24} color="#111827" />
        </View>
        <Text className="text-sm font-semibold text-gray-900">Galeri</Text>
        <Text className="mt-1 text-center text-xs text-gray-500">
          {isImage ? "JPG veya PNG" : "Galeriden seç"}
        </Text>
      </Pressable>
    </View>
  );
}

export function ShareComposerMediaSection({
  selected,
  mediaUri,
  submitting,
  onPickFromCamera,
  onPickFromGallery,
}: ShareComposerMediaSectionProps) {
  if (selected === "tweet") {
    return null;
  }

  const isImage = selected === "image";

  return (
    <View className="mb-4">
      {mediaUri && isImage ? <FeedImagePreview uri={mediaUri} /> : null}

      {mediaUri && selected === "video" ? (
        <View className="mb-3">
          <ShareVideoPreview uri={mediaUri} />
        </View>
      ) : null}

      {mediaUri ? (
        <View>
          <Text className="mb-2 text-xs font-medium text-gray-500">
            Medyayı değiştir
          </Text>
          <MediaSourceCards
            isImage={isImage}
            submitting={submitting}
            onPickFromCamera={onPickFromCamera}
            onPickFromGallery={onPickFromGallery}
          />
        </View>
      ) : (
        <MediaSourceCards
          isImage={isImage}
          submitting={submitting}
          onPickFromCamera={onPickFromCamera}
          onPickFromGallery={onPickFromGallery}
        />
      )}
    </View>
  );
}

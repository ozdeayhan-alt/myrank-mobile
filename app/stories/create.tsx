import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { TabScreenSafeArea } from "@/components/TabScreenSafeArea";
import { useAuth } from "@/features/auth";
import {
  CAPTION_MAX_LENGTH,
  createStory,
  isVideoAsset,
  showStoryMediaPicker,
  uploadStoryMedia,
} from "@/features/stories";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import * as ImagePicker from "expo-image-picker";

export default function CreateStoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePick = () => {
    showStoryMediaPicker((picked) => setAsset(picked));
  };

  const handleShare = async () => {
    if (!user?.uid || !asset) {
      Alert.alert("Medya gerekli", "Önce fotoğraf veya video seç.");
      return;
    }

    setSubmitting(true);
    try {
      const mediaType = isVideoAsset(asset) ? "video" : "image";
      const uploaded = await uploadStoryMedia(
        user.uid,
        asset.uri,
        mediaType,
        asset.mimeType
      );
      const story = await createStory({
        mediaType: uploaded.mediaType,
        mediaURL: uploaded.mediaURL,
        posterURL: uploaded.posterURL ?? null,
        caption: caption.trim() || null,
      });
      router.replace({
        pathname: "/stories/view",
        params: {
          storyId: story.id,
          userId: user.uid,
          scope: "singleUser",
        },
      });
    } catch (error) {
      Alert.alert("Story paylaşılamadı", getUserFacingErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TabScreenSafeArea className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-4" keyboardShouldPersistTaps="handled">
        <Text className="mb-1 text-2xl font-bold text-gray-900">Story</Text>
        <Text className="mb-6 text-sm text-gray-500">
          Fotoğraf veya video paylaş. 24 saat görünür.
        </Text>

        <Pressable
          onPress={handlePick}
          className="mb-4 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50"
          style={{ height: 360 }}
        >
          {asset ? (
            isVideoAsset(asset) ? (
              <View className="items-center">
                <Text className="text-4xl">🎬</Text>
                <Text className="mt-2 text-sm text-gray-600">Video seçildi</Text>
              </View>
            ) : (
              <Image
                source={{ uri: asset.uri }}
                style={{ width: "100%", height: 360 }}
                contentFit="cover"
              />
            )
          ) : (
            <Text className="text-base font-medium text-gray-500">
              Fotoğraf veya video seç
            </Text>
          )}
        </Pressable>

        <Text className="mb-2 text-sm font-semibold text-gray-700">
          Opsiyonel caption
        </Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          maxLength={CAPTION_MAX_LENGTH}
          placeholder="Kısa bir not..."
          className="mb-2 rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900"
        />
        <Text className="mb-6 text-xs text-gray-400">
          {caption.length}/{CAPTION_MAX_LENGTH}
        </Text>

        <Pressable
          disabled={!asset || submitting}
          onPress={handleShare}
          className={`mb-8 items-center rounded-xl py-4 ${
            asset && !submitting ? "bg-gray-900" : "bg-gray-300"
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">Paylaş</Text>
          )}
        </Pressable>
      </ScrollView>
    </TabScreenSafeArea>
  );
}

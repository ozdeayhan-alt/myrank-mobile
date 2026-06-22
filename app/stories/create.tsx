import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAuth } from "@/features/auth";
import { StoryPhotoDisplay } from "@/features/media/components/StoryPhotoDisplay";
import {
  CAPTION_MAX_LENGTH,
  createStory,
  isVideoAsset,
  pickStoryMediaAsset,
  showStoryMediaPicker,
  uploadStoryMedia,
} from "@/features/stories";
import { useStoriesRingStore } from "@/features/stories/store/useStoriesRingStore";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import * as ImagePicker from "expo-image-picker";

function StoryVideoPreview({ uri }: { uri: string }) {
  const { width, height } = useWindowDimensions();
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = true;
    instance.muted = true;
    instance.play();
  });

  return (
    <VideoView
      player={player}
      style={{ width, height }}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

export default function CreateStoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const openedPickerRef = useRef(false);

  useEffect(() => {
    if (openedPickerRef.current) {
      return;
    }
    openedPickerRef.current = true;

    let cancelled = false;
    void (async () => {
      const picked = await pickStoryMediaAsset();
      if (cancelled) {
        return;
      }
      if (!picked) {
        router.back();
        return;
      }
      setAsset(picked);
      setLoadingMedia(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleChangeMedia = () => {
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
      await useStoriesRingStore.getState().reload();
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

  if (loadingMedia || !asset) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  const isVideo = isVideoAsset(asset);

  return (
    <View className="flex-1 bg-black">
      {isVideo ? (
        <StoryVideoPreview uri={asset.uri} />
      ) : (
        <StoryPhotoDisplay uri={asset.uri} style={StyleSheet.absoluteFillObject} />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="absolute inset-x-0 bottom-0"
        pointerEvents="box-none"
      >
        <View
          className="px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <TextInput
            value={caption}
            onChangeText={setCaption}
            maxLength={CAPTION_MAX_LENGTH}
            placeholder="Bir şeyler yaz..."
            placeholderTextColor="rgba(255,255,255,0.55)"
            className="mb-3 rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-base text-white"
          />
          <Pressable
            disabled={submitting}
            onPress={handleShare}
            className={`items-center rounded-full py-3.5 ${
              submitting ? "bg-white/35" : "bg-white"
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="#111" />
            ) : (
              <Text className="text-base font-semibold text-gray-900">
                Hikayene ekle
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-4"
        style={{ top: insets.top + 8 }}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/45"
          accessibilityLabel="Kapat"
        >
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
        <Pressable
          onPress={handleChangeMedia}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/45"
          accessibilityLabel="Medyayı değiştir"
        >
          <Ionicons name="images-outline" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

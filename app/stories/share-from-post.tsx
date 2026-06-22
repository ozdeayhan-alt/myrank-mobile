import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAuth } from "@/features/auth";
import { StoryPhotoDisplay } from "@/features/media/components/StoryPhotoDisplay";
import { fetchPostById } from "@/features/posts/api/fetchPostById";
import {
  resolvePostStoryMedia,
  type PostStoryMedia,
} from "@/features/posts/utils/postStoryShare";
import {
  CAPTION_MAX_LENGTH,
  createStory,
} from "@/features/stories";
import { useStoriesRingStore } from "@/features/stories/store/useStoriesRingStore";
import {
  resolveMediaDisplayUrl,
  resolvePosterDisplayUrl,
  resolveVideoStreamUrl,
} from "@/lib/media/resolveMediaDisplayUrl";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";

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

function defaultCaption(authorName: string | undefined): string {
  const handle = authorName?.trim();
  if (!handle) {
    return "";
  }
  const mention = `@${handle.replace(/\s+/g, "")}`;
  return mention.length <= CAPTION_MAX_LENGTH
    ? mention
    : mention.slice(0, CAPTION_MAX_LENGTH);
}

export default function ShareFromPostStoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [caption, setCaption] = useState("");
  const [storyMedia, setStoryMedia] = useState<PostStoryMedia | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (!postId?.trim()) {
        router.back();
        return;
      }

      try {
        const post = await fetchPostById(postId.trim());
        if (cancelled) {
          return;
        }
        if (!post) {
          Alert.alert("Gönderi bulunamadı");
          router.back();
          return;
        }

        const media = resolvePostStoryMedia(post);
        if (!media) {
          Alert.alert("Story", "Bu gönderi story için uygun değil.");
          router.back();
          return;
        }

        const displayUri =
          media.mediaType === "video"
            ? resolveVideoStreamUrl(media.mediaURL) ??
              resolveMediaDisplayUrl(media.mediaURL)
            : resolveMediaDisplayUrl(media.mediaURL);

        if (!displayUri) {
          Alert.alert("Story", "Medya yüklenemedi.");
          router.back();
          return;
        }

        setStoryMedia(media);
        setPreviewUri(displayUri);
        setCaption(defaultCaption(post.authorDisplayName));
      } catch (error) {
        if (!cancelled) {
          Alert.alert("Hata", getUserFacingErrorMessage(error));
          router.back();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postId, router]);

  const publishMedia = useMemo(() => {
    if (!storyMedia) {
      return null;
    }
    const mediaURL =
      storyMedia.mediaType === "video"
        ? resolveVideoStreamUrl(storyMedia.mediaURL) ??
          resolveMediaDisplayUrl(storyMedia.mediaURL)
        : resolveMediaDisplayUrl(storyMedia.mediaURL);

    if (!mediaURL) {
      return null;
    }

    const posterURL = storyMedia.posterURL
      ? resolvePosterDisplayUrl(storyMedia.posterURL) ??
        resolveMediaDisplayUrl(storyMedia.posterURL)
      : null;

    return {
      mediaType: storyMedia.mediaType,
      mediaURL,
      posterURL,
    };
  }, [storyMedia]);

  const handlePublish = async () => {
    if (!user?.uid || !publishMedia) {
      return;
    }

    setSubmitting(true);
    try {
      const story = await createStory({
        mediaType: publishMedia.mediaType,
        mediaURL: publishMedia.mediaURL,
        posterURL: publishMedia.posterURL,
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

  if (loading || !storyMedia || !previewUri) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {storyMedia.mediaType === "video" ? (
        <StoryVideoPreview uri={previewUri} />
      ) : (
        <StoryPhotoDisplay uri={previewUri} style={StyleSheet.absoluteFillObject} />
      )}

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
          disabled={submitting}
          onPress={() => void handlePublish()}
          className={`rounded-full px-4 py-2 ${
            submitting ? "bg-white/35" : "bg-white"
          }`}
          accessibilityLabel="Hikayene ekle"
        >
          {submitting ? (
            <ActivityIndicator color="#111" size="small" />
          ) : (
            <Text className="text-sm font-semibold text-gray-900">
              Hikayene ekle
            </Text>
          )}
        </Pressable>
      </View>

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
            className="rounded-2xl border border-white/20 bg-black/45 px-4 py-3 text-base text-white"
          />
          <Text className="mt-1 text-right text-xs text-white/50">
            {caption.length}/{CAPTION_MAX_LENGTH}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

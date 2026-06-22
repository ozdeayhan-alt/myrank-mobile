import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPINNER_COLOR, ui } from "@/lib/uiClasses";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { repostPost } from "../api/repostPost";
import { REPOST_CAPTION_MAX_LENGTH } from "../constants";
import type { Post } from "../types";
import { EmbeddedOriginalPost } from "./EmbeddedOriginalPost";
import { resolveEmbeddedOriginalPost } from "../utils/repostUtils";

type RepostQuoteModalProps = {
  visible: boolean;
  post: Post;
  onClose: () => void;
  onReposted?: () => void;
  onOpenVideo?: (postId: string) => void;
};

export function RepostQuoteModal({
  visible,
  post,
  onClose,
  onReposted,
  onOpenVideo,
}: RepostQuoteModalProps) {
  const { height: windowHeight } = useWindowDimensions();
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const embedded = resolveEmbeddedOriginalPost(post) ?? post;
  const sheetMaxHeight = Math.round(windowHeight * 0.92);

  useEffect(() => {
    if (visible) {
      setCaption("");
      setError(null);
    }
  }, [visible, post.id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await repostPost(post.id, caption);
      onReposted?.();
      onClose();
    } catch (err) {
      setError(getUserFacingErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/45">
          <View
            className="overflow-hidden rounded-t-3xl bg-white"
            style={{ maxHeight: sheetMaxHeight }}
          >
            <View className="items-center pb-2 pt-3">
              <View className="h-1 w-10 rounded-full bg-gray-300" />
            </View>

            <View className="flex-row items-center justify-between border-b border-gray-100 px-4 pb-3">
              <Pressable
                onPress={onClose}
                disabled={submitting}
                className="min-w-[64px] py-1"
                accessibilityLabel="İptal"
              >
                <Text className="text-base font-medium text-gray-600">İptal</Text>
              </Pressable>
              <Text className="text-base font-semibold text-gray-900">
                Akışa paylaş
              </Text>
              <Pressable
                onPress={() => void handleSubmit()}
                disabled={submitting}
                className="min-w-[64px] items-end py-1"
                accessibilityLabel="Paylaş"
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={SPINNER_COLOR} />
                ) : (
                  <Text className="text-base font-semibold text-gray-900">
                    Paylaş
                  </Text>
                )}
              </Pressable>
            </View>

            <ScrollView
              className="flex-shrink px-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }}
            >
              <TextInput
                className="mb-1 min-h-[72px] px-1 py-2 text-base text-gray-900"
                placeholder="Bir şeyler ekle..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={caption}
                onChangeText={setCaption}
                maxLength={REPOST_CAPTION_MAX_LENGTH}
                editable={!submitting}
                textAlignVertical="top"
              />
              <Text className="mb-4 text-right text-xs text-gray-400">
                {caption.length}/{REPOST_CAPTION_MAX_LENGTH}
              </Text>

              <EmbeddedOriginalPost
                post={embedded}
                onOpenVideo={onOpenVideo}
                variant="compact"
              />

              {error ? (
                <View className="mt-3 rounded-xl bg-red-50 px-4 py-3">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              ) : null}
            </ScrollView>

            <SafeAreaView edges={["bottom"]} className="bg-white" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

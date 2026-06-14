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
  const sheetMaxHeight = Math.round(windowHeight * 0.9);

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
        <View className="flex-1 justify-end bg-black/40">
          <View
            className="overflow-hidden rounded-t-3xl bg-white"
            style={{ maxHeight: sheetMaxHeight }}
          >
            <View className="px-6 pb-2 pt-6">
              <Text className="mb-1 text-xl font-bold text-gray-900">
                Akışa paylaş
              </Text>
              <Text className="text-sm text-gray-500">
                İsteğe bağlı alıntı metni ekleyebilirsiniz.
              </Text>
            </View>

            <ScrollView
              className="flex-shrink px-6"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <TextInput
                className="mb-3 min-h-[96px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                placeholder="Düşüncenizi yazın..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={caption}
                onChangeText={setCaption}
                maxLength={REPOST_CAPTION_MAX_LENGTH}
                editable={!submitting}
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
                <View className="mb-2 rounded-xl bg-red-50 px-4 py-3">
                  <Text className="text-sm text-red-700">{error}</Text>
                </View>
              ) : null}
            </ScrollView>

            <SafeAreaView edges={["bottom"]} className="border-t border-gray-100 bg-white">
              <View className="px-6 pb-2 pt-3">
                <Pressable
                  className={`mb-3 ${ui.btnPrimary} ${submitting ? "opacity-60" : ""}`}
                  onPress={() => void handleSubmit()}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color={SPINNER_COLOR} />
                  ) : (
                    <Text className={ui.btnPrimaryText}>Paylaş</Text>
                  )}
                </Pressable>
                <Pressable
                  className="items-center py-2"
                  onPress={onClose}
                  disabled={submitting}
                >
                  <Text className="font-medium text-gray-500">İptal</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SPINNER_COLOR } from "@/lib/uiClasses";
import {
  POST_CAPTION_MAX_LENGTH,
  TWEET_MAX_LENGTH,
} from "../constants";
import { CONTENT_TYPE_LABELS } from "../constants/contentTypeLabels";
import type { PostContentType } from "../types";

const DONE_BLUE = "#0095F6";

type EditPostTextModalProps = {
  visible: boolean;
  contentType: PostContentType;
  initialContent: string;
  submitting: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
};

function maxLengthForType(contentType: PostContentType): number {
  return contentType === "tweet" ? TWEET_MAX_LENGTH : POST_CAPTION_MAX_LENGTH;
}

function placeholderForType(contentType: PostContentType): string {
  if (contentType === "tweet") {
    return `${CONTENT_TYPE_LABELS.tweet} metnini yazın…`;
  }
  return "Açıklamayı yazın (opsiyonel)…";
}

export function EditPostTextModal({
  visible,
  contentType,
  initialContent,
  submitting,
  onClose,
  onSave,
}: EditPostTextModalProps) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(initialContent);
  const maxLength = maxLengthForType(contentType);

  useEffect(() => {
    if (visible) {
      setText(initialContent);
    }
  }, [visible, initialContent]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3">
          <Pressable
            onPress={onClose}
            disabled={submitting}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="İptal"
            className="min-w-[72px]"
          >
            <Text className="text-base text-gray-600">İptal</Text>
          </Pressable>

          <Text className="text-base font-semibold text-gray-900">
            Metni düzenle
          </Text>

          <Pressable
            onPress={() => onSave(text)}
            disabled={submitting}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Bitti"
            className="min-w-[72px] items-end"
          >
            {submitting ? (
              <ActivityIndicator size="small" color={DONE_BLUE} />
            ) : (
              <Text
                className="text-base font-semibold"
                style={{ color: DONE_BLUE }}
              >
                Bitti
              </Text>
            )}
          </Pressable>
        </View>

        <View className="flex-1 px-4 pt-4">
          {contentType !== "tweet" ? (
            <Text className="mb-3 text-sm text-gray-500">
              Medya aynı kalır; yalnızca açıklama değişir.
            </Text>
          ) : null}

          <TextInput
            className="min-h-[160px] flex-1 text-base leading-6 text-gray-900"
            placeholder={placeholderForType(contentType)}
            placeholderTextColor="#9CA3AF"
            multiline
            autoFocus
            value={text}
            onChangeText={setText}
            editable={!submitting}
            maxLength={maxLength}
            textAlignVertical="top"
          />

          <Text className="py-3 text-right text-xs text-gray-400">
            {text.length}/{maxLength}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

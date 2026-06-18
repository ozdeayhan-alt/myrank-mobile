import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SPINNER_COLOR, ui } from "@/lib/uiClasses";
import {
  POST_CAPTION_MAX_LENGTH,
  TWEET_MAX_LENGTH,
} from "../constants";
import { CONTENT_TYPE_LABELS } from "../constants/contentTypeLabels";
import type { PostContentType } from "../types";

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
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[85%] rounded-t-3xl bg-white px-6 pb-10 pt-6">
          <Text className="mb-1 text-lg font-bold text-gray-900">
            Metni düzenle
          </Text>
          <Text className="mb-4 text-sm text-gray-500">
            {contentType === "tweet"
              ? `${CONTENT_TYPE_LABELS.tweet} metnini güncelleyin.`
              : "Medya aynı kalır; yalnızca açıklama değişir."}
          </Text>

          <TextInput
            className="mb-2 min-h-[120px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
            placeholder={placeholderForType(contentType)}
            placeholderTextColor="#9CA3AF"
            multiline
            value={text}
            onChangeText={setText}
            editable={!submitting}
            maxLength={maxLength}
          />
          <Text className="mb-4 text-right text-xs text-gray-400">
            {text.length}/{maxLength}
          </Text>

          <Pressable
            className={`mb-3 ${ui.btnPrimary} ${submitting ? "opacity-60" : ""}`}
            onPress={() => onSave(text)}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={SPINNER_COLOR} />
            ) : (
              <Text className={ui.btnPrimaryText}>Kaydet</Text>
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
      </View>
    </Modal>
  );
}

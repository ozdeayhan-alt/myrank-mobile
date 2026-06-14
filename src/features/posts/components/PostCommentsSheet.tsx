import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { sendPostInteractionSafe } from "@/features/ranking/api/sendPostInteraction";
import { usePostComments } from "@/features/ranking/hooks/usePostComments";
import type { InteractionResponse } from "@/features/ranking/types";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { SPINNER_COLOR, ui } from "@/lib/uiClasses";
import { PostCommentRow } from "./PostCommentRow";

type PostCommentsSheetProps = {
  visible: boolean;
  postId: string;
  onClose: () => void;
  onCommentSuccess?: (result: InteractionResponse) => void;
};

const SUBMIT_MIN_HEIGHT = 48;
const KEYBOARD_VERTICAL_OFFSET = Platform.OS === "ios" ? 8 : 0;

export function PostCommentsSheet({
  visible,
  postId,
  onClose,
  onCommentSuccess,
}: PostCommentsSheetProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const {
    comments,
    loading: commentsLoading,
    refresh,
    prependComment,
  } = usePostComments(postId, visible);

  const sheetMaxHeight = Math.round(windowHeight * 0.88);

  useEffect(() => {
    if (visible) {
      setCommentText("");
      setSubmitting(false);
    }
  }, [visible, postId]);

  const handleSubmit = useCallback(async () => {
    const trimmed = commentText.trim();
    if (!trimmed) {
      Alert.alert("Eksik yorum", "Lütfen bir yorum yazın.");
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendPostInteractionSafe({
        postId,
        type: "comment",
        commentText: trimmed,
      });

      if (!result) {
        return;
      }

      setCommentText("");
      Keyboard.dismiss();

      if (result.comment) {
        prependComment(result.comment);
      } else {
        await refresh();
      }

      onCommentSuccess?.(result);
      onClose();
    } catch (error) {
      Alert.alert("Yorum gönderilemedi", getUserFacingErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [
    commentText,
    onClose,
    onCommentSuccess,
    postId,
    prependComment,
    refresh,
    submitting,
  ]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === "android"}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Pressable
            className="flex-1"
            onPress={onClose}
            accessibilityLabel="Kapat"
          />

          <View
            className="overflow-hidden rounded-t-3xl bg-white"
            style={{ maxHeight: sheetMaxHeight }}
          >
            <View className="flex-row items-center justify-between px-6 pb-2 pt-6">
              <Text className="text-lg font-bold text-gray-900">Yorumlar</Text>
              <Pressable onPress={onClose} hitSlop={12} disabled={submitting}>
                <Text className="font-medium text-gray-500">Kapat</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              nestedScrollEnabled
              showsVerticalScrollIndicator
              style={styles.commentsScroll}
              contentContainerStyle={styles.commentsContent}
            >
              {commentsLoading ? (
                <ActivityIndicator className="my-4" color={SPINNER_COLOR} />
              ) : comments.length === 0 ? (
                <Text className="py-4 text-center text-sm text-gray-400">
                  Henüz yorum yok. İlk yorumu sen yaz!
                </Text>
              ) : (
                comments.map((comment) => (
                  <PostCommentRow key={comment.id} comment={comment} />
                ))
              )}
            </ScrollView>

            <View
              className="border-t border-gray-100 bg-white px-6 pt-3"
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}
            >
              <TextInput
                ref={inputRef}
                className="mb-3 min-h-[72px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                placeholder="Yorumunuzu yazın..."
                placeholderTextColor="#9CA3AF"
                multiline
                blurOnSubmit={false}
                value={commentText}
                onChangeText={setCommentText}
                editable={!submitting}
              />

              <Pressable
                onPress={() => {
                  void handleSubmit();
                }}
                disabled={submitting}
                className={`items-center justify-center rounded-xl border border-gray-900 bg-gray-900 py-3 ${
                  submitting ? "opacity-60" : ""
                }`}
                style={{ minHeight: SUBMIT_MIN_HEIGHT }}
                accessibilityRole="button"
                accessibilityLabel="Yorum gönder"
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className={`${ui.btnPrimaryText} text-white`}>
                    Gönder (+33)
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  commentsScroll: {
    flexGrow: 0,
    maxHeight: 360,
  },
  commentsContent: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
});

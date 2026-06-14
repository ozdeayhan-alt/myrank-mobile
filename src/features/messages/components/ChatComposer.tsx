import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/features/auth";
import { showMediaSourcePicker } from "@/lib/media/pickMedia";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { uploadMessageMedia } from "../api/uploadMessageMedia";
import { MESSAGE_MAX_LENGTH } from "../constants";
import type { SendMessageInput } from "../types";
import { messageTheme } from "../theme";

type ChatComposerProps = {
  sending: boolean;
  onSend: (input: SendMessageInput) => Promise<void>;
  onFocus?: () => void;
};

export function ChatComposer({ sending, onSend, onFocus }: ChatComposerProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);

  const busy = sending || uploading;

  const handleSendText = async () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setText("");
    await onSend({ type: "text", text: trimmed });
  };

  const handleAttachMedia = () => {
    if (busy || !user?.uid) return;

    Alert.alert("Medya ekle", "Göndermek istediğiniz türü seçin", [
      {
        text: "Fotoğraf",
        onPress: () => {
          showMediaSourcePicker("image", (asset) => {
            void (async () => {
              setUploading(true);
              try {
                const uploaded = await uploadMessageMedia(
                  user.uid,
                  asset.uri,
                  "image",
                  asset.mimeType
                );
                await onSend({
                  type: "image",
                  mediaURL: uploaded.mediaURL,
                  ...(text.trim() ? { text: text.trim() } : {}),
                });
                setText("");
              } catch (error) {
                Alert.alert(
                  "Gönderilemedi",
                  getUserFacingErrorMessage(error)
                );
              } finally {
                setUploading(false);
              }
            })();
          });
        },
      },
      {
        text: "Video",
        onPress: () => {
          showMediaSourcePicker("video", (asset) => {
            void (async () => {
              setUploading(true);
              try {
                const uploaded = await uploadMessageMedia(
                  user.uid,
                  asset.uri,
                  "video",
                  asset.mimeType
                );
                await onSend({
                  type: "video",
                  mediaURL: uploaded.mediaURL,
                  posterURL: uploaded.posterURL,
                  ...(text.trim() ? { text: text.trim() } : {}),
                });
                setText("");
              } catch (error) {
                Alert.alert(
                  "Gönderilemedi",
                  getUserFacingErrorMessage(error)
                );
              } finally {
                setUploading(false);
              }
            })();
          });
        },
      },
      { text: "Vazgeç", style: "cancel" },
    ]);
  };

  return (
    <View
      className="flex-row items-end border-t px-3 py-2"
      style={{
        backgroundColor: messageTheme.composerBg,
        borderColor: messageTheme.border,
      }}
    >
      <Pressable
        onPress={handleAttachMedia}
        disabled={busy}
        className="mb-0.5 mr-2 h-11 w-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: messageTheme.composerInputBg,
          borderWidth: 1,
          borderColor: messageTheme.border,
          opacity: busy ? 0.45 : 1,
        }}
        accessibilityRole="button"
        accessibilityLabel="Medya ekle"
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#6B7280" />
        ) : (
          <Ionicons name="image-outline" size={20} color="#6B7280" />
        )}
      </Pressable>

      <TextInput
        className="mr-2 max-h-28 flex-1 rounded-full border px-4 py-2.5 text-base text-gray-900"
        style={{
          backgroundColor: messageTheme.composerInputBg,
          borderColor: messageTheme.border,
          ...(Platform.OS === "android" ? { textAlignVertical: "center" } : null),
        }}
        placeholder="Mesaj yazın..."
        placeholderTextColor={messageTheme.textMuted}
        multiline
        value={text}
        onChangeText={setText}
        onFocus={onFocus}
        maxLength={MESSAGE_MAX_LENGTH}
        editable={!busy}
      />
      <Pressable
        onPress={() => void handleSendText()}
        disabled={busy || !text.trim()}
        className="mb-0.5 h-11 w-11 items-center justify-center rounded-full"
        style={{
          backgroundColor: messageTheme.sendButton,
          opacity: busy || !text.trim() ? 0.45 : 1,
        }}
        accessibilityRole="button"
        accessibilityLabel="Mesaj gönder"
      >
        {sending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="send" size={18} color="#FFFFFF" />
        )}
      </Pressable>
    </View>
  );
}

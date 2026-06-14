import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@/features/auth";
import { showMediaSourcePicker } from "@/lib/media/pickMedia";
import { SHARE_COMPOSER_OPTIONS } from "../constants/shareComposerOptions";
import { useShareComposerSubmit } from "../hooks/useShareComposerSubmit";
import {
  POST_CAPTION_MAX_LENGTH,
  TWEET_MAX_LENGTH,
} from "../constants";
import type { PostContentType } from "../types";
import { ShareCircleButton } from "./ShareCircleButton";
import { MentionSuggestions } from "./MentionSuggestions";
import { ShareComposerMediaSection } from "./ShareComposerMediaSection";

function getActiveMentionQuery(text: string): string | null {
  const match = text.match(/@([\p{L}\p{N}_.]{0,30})$/u);
  return match ? match[1] : null;
}

type ShareComposerProps = {
  initialType?: PostContentType;
  onClose: () => void;
  onCreated?: () => void;
  variant: "sheet" | "screen";
};

export function ShareComposer({
  initialType = "tweet",
  onClose,
  onCreated,
  variant,
}: ShareComposerProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<PostContentType>(initialType);
  const [content, setContent] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaMimeType, setMediaMimeType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prepareMessage, setPrepareMessage] = useState<string | null>(null);
  const [prepareProgress, setPrepareProgress] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelected(initialType);
    setContent("");
    setMediaUri(null);
    setMediaMimeType(null);
    setSuccessMessage(null);
  }, [initialType]);

  const maxLength =
    selected === "tweet" ? TWEET_MAX_LENGTH : POST_CAPTION_MAX_LENGTH;
  const mentionQuery = getActiveMentionQuery(content);

  const canSubmit = useMemo(() => {
    if (selected === "tweet") {
      return content.trim().length > 0;
    }
    return mediaUri !== null;
  }, [content, mediaUri, selected]);

  const handleSelectType = (type: PostContentType) => {
    setSelected(type);
    if (type === "tweet") {
      setMediaUri(null);
      setMediaMimeType(null);
    }
  };

  const handlePickMedia = () => {
    showMediaSourcePicker(selected === "image" ? "image" : "video", (asset) => {
      setMediaUri(asset.uri);
      setMediaMimeType(asset.mimeType ?? null);
    });
  };

  const handleShare = useShareComposerSubmit({
    userId: user?.uid,
    selected,
    content,
    mediaUri,
    mediaMimeType,
    canSubmit,
    onCreated,
    onClose,
    setSubmitting,
    setPrepareMessage,
    setPrepareProgress,
    setSuccessMessage,
  });

  const selectedHint =
    SHARE_COMPOSER_OPTIONS.find((o) => o.type === selected)?.hint ?? "";
  const isSheet = variant === "sheet";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className={isSheet ? "h-full" : "flex-1"}
      style={isSheet ? { flex: 1 } : undefined}
    >
      {variant === "sheet" ? (
        <View className="mb-3 items-center">
          <View className="h-1 w-10 rounded-full bg-gray-300" />
        </View>
      ) : null}

      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={onClose}
          disabled={submitting}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="İptal"
          className="min-w-[64px] py-1"
        >
          <Text className="text-base font-medium text-gray-600">İptal</Text>
        </Pressable>

        <Text className="text-base font-semibold text-gray-900">
          Yeni gönderi
        </Text>

        <View className="min-w-[64px]" />
      </View>

      {successMessage ? (
        <View className="mb-4 flex-row items-center justify-center rounded-xl bg-gray-900 px-4 py-3">
          <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
          <Text className="ml-2 text-sm font-medium text-white">
            {successMessage}
          </Text>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 flex-row gap-2">
          {SHARE_COMPOSER_OPTIONS.map(({ type, label, icon }) => {
            const active = selected === type;
            return (
              <Pressable
                key={type}
                className={`flex-1 items-center rounded-2xl border px-2 py-3 ${
                  active
                    ? "border-gray-900 bg-gray-50 shadow-sm"
                    : "border-gray-200 bg-white"
                }`}
                onPress={() => handleSelectType(type)}
                disabled={submitting}
              >
                <Ionicons
                  name={icon}
                  size={22}
                  color={active ? "#111827" : "#6B7280"}
                />
                <Text
                  className={`mt-1.5 text-xs font-semibold ${
                    active ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-3 text-sm text-gray-500">{selectedHint}</Text>

        <ShareComposerMediaSection
          selected={selected}
          mediaUri={mediaUri}
          submitting={submitting}
          onPickMedia={() => void handlePickMedia()}
        />

        {mentionQuery !== null ? (
          <MentionSuggestions
            query={mentionQuery}
            onSelect={(displayName) => {
              setContent((prev) =>
                prev.replace(/@([\p{L}\p{N}_.]{0,30})$/u, `@${displayName} `)
              );
            }}
          />
        ) : null}

        <TextInput
          className="mb-2 min-h-[120px] rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
          placeholder={
            selected === "tweet"
              ? "Ne düşünüyorsun?"
              : "Açıklama ekle (opsiyonel)…"
          }
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={maxLength}
          value={content}
          onChangeText={setContent}
          editable={!submitting}
          textAlignVertical="top"
        />

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xs text-gray-400">
            Paylaşım puan kazandırır
          </Text>
          <Text
            className={`text-xs font-medium ${
              content.length >= maxLength ? "text-red-500" : "text-gray-400"
            }`}
          >
            {content.length}/{maxLength}
          </Text>
        </View>

        {submitting && prepareMessage ? (
          <View className="mb-4">
            <View className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <View
                className="h-full rounded-full bg-gray-900"
                style={{
                  width: `${Math.round((prepareProgress ?? 0) * 100)}%`,
                }}
              />
            </View>
            <Text className="text-center text-xs text-gray-500">
              {prepareMessage}
              {prepareProgress !== null
                ? ` · %${Math.round(prepareProgress * 100)}`
                : ""}
            </Text>
          </View>
        ) : null}

        <View className="items-center pb-6 pt-2">
          <ShareCircleButton
            onPress={() => void handleShare()}
            disabled={!canSubmit}
            loading={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

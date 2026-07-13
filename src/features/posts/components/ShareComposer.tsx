import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "@/features/auth";
import { findProviderForUrl } from "@/features/flow/providers/registry";
import {
  pickImageFromCamera,
  pickImageFromLibrary,
} from "@/lib/media/pickMedia";
import { SPINNER_COLOR } from "@/lib/uiClasses";
import { fetchLinkPreview, type LinkPreview } from "../api/fetchLinkPreview";
import {
  getShareComposerPlaceholder,
  getContentTypeLabel,
} from "../constants/contentTypeLabels";
import { SHARE_COMPOSER_OPTIONS } from "../constants/shareComposerOptions";
import { useShareComposerSubmit } from "../hooks/useShareComposerSubmit";
import {
  POST_CAPTION_MAX_LENGTH,
  TWEET_MAX_LENGTH,
} from "../constants";
import type { ShareContentType } from "../types";
import { ShareCircleButton } from "./ShareCircleButton";
import { MentionSuggestions } from "./MentionSuggestions";
import { ShareComposerMediaSection } from "./ShareComposerMediaSection";

function getActiveMentionQuery(text: string): string | null {
  const match = text.match(/@([\p{L}\p{N}_.]{0,30})$/u);
  return match ? match[1] : null;
}

type ShareComposerProps = {
  initialType?: ShareContentType;
  /** Hub'dan tür seçildiyse üstteki pill satırını gizle */
  showTypePicker?: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function ShareComposer({
  initialType = "tweet",
  showTypePicker = true,
  onClose,
  onCreated,
}: ShareComposerProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<ShareContentType>(initialType);
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaMimeType, setMediaMimeType] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [prepareMessage, setPrepareMessage] = useState<string | null>(null);
  const [prepareProgress, setPrepareProgress] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [linkPreviewLoading, setLinkPreviewLoading] = useState(false);
  const clipboardAutofillDoneRef = useRef(false);

  useEffect(() => {
    setSelected(initialType);
    setContent("");
    setLinkUrl("");
    setMediaUri(null);
    setMediaMimeType(null);
    setSuccessMessage(null);
    setLinkPreview(null);
    setLinkPreviewLoading(false);
    clipboardAutofillDoneRef.current = false;
  }, [initialType]);

  useEffect(() => {
    if (selected !== "tweet") {
      setLinkPreview(null);
      setLinkPreviewLoading(false);
      return;
    }

    const trimmed = linkUrl.trim();
    if (trimmed.length < 4) {
      setLinkPreview(null);
      setLinkPreviewLoading(false);
      return;
    }

    setLinkPreviewLoading(true);
    const handle = setTimeout(() => {
      void (async () => {
        try {
          const preview = await fetchLinkPreview(trimmed);
          setLinkPreview(preview);
        } catch {
          setLinkPreview(null);
        } finally {
          setLinkPreviewLoading(false);
        }
      })();
    }, 450);

    return () => clearTimeout(handle);
  }, [linkUrl, selected]);

  useEffect(() => {
    if (selected !== "flow") {
      clipboardAutofillDoneRef.current = false;
      return;
    }

    if (clipboardAutofillDoneRef.current || linkUrl.trim()) {
      return;
    }

    clipboardAutofillDoneRef.current = true;

    void (async () => {
      try {
        const text = (await Clipboard.getStringAsync()).trim();
        if (text && findProviderForUrl(text)) {
          setLinkUrl(text);
        }
      } catch {
        // Clipboard okunamazsa sessizce devam et.
      }
    })();
  }, [selected, linkUrl]);

  const maxLength =
    selected === "tweet" ? TWEET_MAX_LENGTH : POST_CAPTION_MAX_LENGTH;
  const mentionQuery = getActiveMentionQuery(content);

  const canSubmit = useMemo(() => {
    if (selected === "tweet") {
      return content.trim().length > 0;
    }
    if (selected === "flow") {
      return linkUrl.trim().length > 0;
    }
    return mediaUri !== null;
  }, [content, linkUrl, mediaUri, selected]);

  const handleSelectType = (type: ShareContentType) => {
    setSelected(type);
    if (type === "tweet" || type === "flow") {
      setMediaUri(null);
      setMediaMimeType(null);
    }
    if (type !== "tweet") {
      if (type !== "flow") {
        setLinkUrl("");
      }
    }
    if (type === "flow") {
      clipboardAutofillDoneRef.current = false;
    }
  };

  const handlePasteFromClipboard = () => {
    void (async () => {
      try {
        const text = (await Clipboard.getStringAsync()).trim();
        if (text) {
          setLinkUrl(text);
        }
      } catch {
        // ignore
      }
    })();
  };

  const handleMediaAsset = (uri: string, mimeType: string | null) => {
    setMediaUri(uri);
    setMediaMimeType(mimeType);
  };

  const handlePickFromCamera = () => {
    if (submitting) {
      return;
    }

    void (async () => {
      const asset = await pickImageFromCamera({ allowsEditing: false });
      if (asset) {
        handleMediaAsset(asset.uri, asset.mimeType ?? null);
      }
    })();
  };

  const handlePickFromGallery = () => {
    if (submitting) {
      return;
    }

    void (async () => {
      const asset = await pickImageFromLibrary({ allowsEditing: false });
      if (asset) {
        handleMediaAsset(asset.uri, asset.mimeType ?? null);
      }
    })();
  };

  const handleShare = useShareComposerSubmit({
    userId: user?.uid,
    selected,
    content,
    linkUrl,
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
  const headerTitle = showTypePicker
    ? "Yeni gönderi"
    : `Yeni ${getContentTypeLabel(selected)}`;

  const flowLinkField = (
    <View className="mb-3">
      <TextInput
        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
        placeholder="Video bağlantısı (ör. youtube.com/...)"
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        value={linkUrl}
        onChangeText={setLinkUrl}
        editable={!submitting}
      />
      <Pressable
        onPress={handlePasteFromClipboard}
        disabled={submitting}
        className="mt-2 self-start flex-row items-center rounded-lg px-1 py-1"
        accessibilityRole="button"
        accessibilityLabel="Panodan yapıştır"
      >
        <Ionicons name="clipboard-outline" size={16} color="#6B7280" />
        <Text className="ml-1.5 text-xs font-medium text-gray-500">
          Panodan yapıştır
        </Text>
      </Pressable>
    </View>
  );

  const commentField = (
    <TextInput
      className={`rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900 ${
        selected === "flow" ? "mb-4 min-h-[96px]" : "mb-2 min-h-[120px]"
      }`}
      placeholder={getShareComposerPlaceholder(selected)}
      placeholderTextColor="#9CA3AF"
      multiline
      maxLength={maxLength}
      value={content}
      onChangeText={setContent}
      editable={!submitting}
      textAlignVertical="top"
    />
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="mb-4 flex-row items-center justify-center">
        <Text className="text-base font-semibold text-gray-900">
          {headerTitle}
        </Text>
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
        contentContainerStyle={
          showTypePicker
            ? undefined
            : { flexGrow: 1, justifyContent: "flex-end" }
        }
      >
        {showTypePicker ? (
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
        ) : null}

        {showTypePicker ? (
          <Text className="mb-3 text-sm text-gray-500">{selectedHint}</Text>
        ) : null}

        <ShareComposerMediaSection
          selected={selected}
          mediaUri={mediaUri}
          submitting={submitting}
          onPickFromCamera={handlePickFromCamera}
          onPickFromGallery={handlePickFromGallery}
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

        {selected === "flow" ? (
          <>
            {flowLinkField}
            {commentField}
          </>
        ) : (
          <>
            {commentField}
            {selected === "tweet" ? (
              <>
                <TextInput
                  className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900"
                  placeholder="Link ekle (isteğe bağlı, örnek: site.com)"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  value={linkUrl}
                  onChangeText={setLinkUrl}
                  editable={!submitting}
                />
                {linkPreviewLoading ? (
                  <View className="mb-4 items-center py-3">
                    <ActivityIndicator size="small" color={SPINNER_COLOR} />
                  </View>
                ) : linkPreview ? (
                  <View className="mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {linkPreview.linkImageUrl ? (
                      <Image
                        source={{ uri: linkPreview.linkImageUrl }}
                        className="h-28 w-full bg-gray-200"
                        contentFit="cover"
                      />
                    ) : null}
                    <View className="px-3 py-2">
                      <Text
                        className="text-sm font-medium text-gray-900"
                        numberOfLines={2}
                      >
                        {linkPreview.linkTitle ?? linkPreview.linkUrl}
                      </Text>
                      {linkPreview.linkDescription ? (
                        <Text
                          className="mt-1 text-xs text-gray-600"
                          numberOfLines={2}
                        >
                          {linkPreview.linkDescription}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ) : null}
              </>
            ) : null}
          </>
        )}

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xs text-gray-400">
            Paylaşım puan kazandırır
          </Text>
          {selected !== "flow" || content.length > 0 ? (
            <Text
              className={`text-xs font-medium ${
                content.length >= maxLength ? "text-red-500" : "text-gray-400"
              }`}
            >
              {content.length}/{maxLength}
            </Text>
          ) : (
            <Text className="text-xs text-gray-400">Yorum isteğe bağlı</Text>
          )}
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

        <View className="flex-row items-end justify-between pb-6 pt-2">
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
          <ShareCircleButton
            onPress={() => void handleShare()}
            disabled={!canSubmit}
            loading={submitting}
          />
          <View className="min-w-[64px]" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

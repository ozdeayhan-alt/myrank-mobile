import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  View,
} from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/features/auth";
import { markConversationRead } from "@/features/messages/api/markConversationRead";
import { sendMessage as sendMessageApi } from "@/features/messages/api/sendMessage";
import { ChatBubble } from "@/features/messages/components/ChatBubble";
import { ChatComposer } from "@/features/messages/components/ChatComposer";
import { CHAT_COMPOSER_HEIGHT } from "@/features/messages/constants";
import { useConversationMessages } from "@/features/messages/hooks/useConversationMessages";
import type { ChatMessage } from "@/features/messages/types";
import { messageTheme } from "@/features/messages/theme";
import { useProfileStore } from "@/features/profile/store/useProfileStore";
import { getUserFacingErrorMessage } from "@/lib/userFacingErrors";
import { useKeyboardBottomOffset } from "@/lib/useKeyboardHeight";
import { SPINNER_COLOR } from "@/lib/uiClasses";

export default function ConversationScreen() {
  const { user } = useAuth();
  const { conversationId, title, photoURL } = useLocalSearchParams<{
    conversationId: string;
    title?: string;
    photoURL?: string;
  }>();
  const myDisplayName = useProfileStore((s) => s.displayName);
  const myPhotoURL = useProfileStore((s) => s.photoURL);
  const insets = useSafeAreaInsets();
  const keyboardOffset = useKeyboardBottomOffset();
  const listRef = useRef<FlashListRef<ChatMessage>>(null);
  const [sending, setSending] = useState(false);

  const composerBottom =
    keyboardOffset > 0 ? keyboardOffset : insets.bottom;
  const listBottomPadding = CHAT_COMPOSER_HEIGHT + composerBottom;

  const otherPhotoURL = photoURL?.trim() || undefined;
  const otherFallbackLetter = title?.trim().slice(0, 1).toUpperCase() || "?";
  const myFallbackLetter = myDisplayName.trim().slice(0, 1).toUpperCase() || "?";

  const scrollToLatest = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const { messages, loading, error } = useConversationMessages(
    conversationId ?? null
  );

  useEffect(() => {
    if (!conversationId) return;
    void markConversationRead(conversationId).catch(() => {
      // non-blocking
    });
  }, [conversationId]);

  useEffect(() => {
    if (messages.length === 0) return;
    scrollToLatest(true);
  }, [messages.length, scrollToLatest]);

  useEffect(() => {
    if (keyboardOffset === 0) return;
    const timer = setTimeout(() => scrollToLatest(true), 150);
    return () => clearTimeout(timer);
  }, [keyboardOffset, scrollToLatest]);

  const handleSend = useCallback(
    async (input: Parameters<typeof sendMessageApi>[1]) => {
      if (!conversationId) return;
      setSending(true);
      try {
        await sendMessageApi(conversationId, input);
      } catch (err) {
        Alert.alert("Mesaj gönderilemedi", getUserFacingErrorMessage(err));
      } finally {
        setSending(false);
      }
    },
    [conversationId]
  );

  const handleComposerFocus = useCallback(() => {
    scrollToLatest(true);
  }, [scrollToLatest]);

  const headerTitle = title?.trim() || "Sohbet";

  const listContentStyle = useMemo(
    () => ({
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 12 + listBottomPadding,
    }),
    [listBottomPadding]
  );

  const renderMessage = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => {
      const isMine = item.senderId === user?.uid;
      const prev = index > 0 ? messages[index - 1] : null;
      const showAvatar = !prev || prev.senderId !== item.senderId;

      return (
        <ChatBubble
          message={item}
          isMine={isMine}
          showAvatar={showAvatar}
          avatarPhotoURL={isMine ? myPhotoURL : otherPhotoURL}
          avatarFallbackLetter={isMine ? myFallbackLetter : otherFallbackLetter}
        />
      );
    },
    [
      messages,
      user?.uid,
      myPhotoURL,
      myFallbackLetter,
      otherPhotoURL,
      otherFallbackLetter,
    ]
  );

  const messageList = loading ? (
    <ActivityIndicator
      size="large"
      color={SPINNER_COLOR}
      className="mt-12"
    />
  ) : error ? (
    <View className="mx-4 mt-6 rounded-xl bg-red-50 px-4 py-3">
      <Text className="text-sm text-red-700">{error}</Text>
    </View>
  ) : (
    <FlashList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={listContentStyle}
      ListEmptyComponent={
        <View className="items-center py-16">
          <Text className="text-center text-sm text-gray-500">
            Merhaba 👋{"\n"}İlk mesajı sen gönder.
          </Text>
        </View>
      }
      renderItem={renderMessage}
      onContentSizeChange={() => scrollToLatest(false)}
    />
  );

  return (
    <View className="flex-1" style={{ backgroundColor: messageTheme.screenBg }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: headerTitle,
          headerBackTitle: "Geri",
          headerStyle: { backgroundColor: messageTheme.rowBg },
          headerTitleStyle: { color: messageTheme.textPrimary },
        }}
      />

      <View className="flex-1">
        {messageList}
        <View style={{ paddingBottom: composerBottom }}>
          <ChatComposer
            sending={sending}
            onSend={handleSend}
            onFocus={handleComposerFocus}
          />
        </View>
      </View>
    </View>
  );
}

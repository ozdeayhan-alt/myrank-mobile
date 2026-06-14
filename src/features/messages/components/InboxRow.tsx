import { Pressable, Text, View } from "react-native";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { InboxEntry } from "../types";
import { messageTheme } from "../theme";

function formatListTime(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

type InboxRowProps = {
  entry: InboxEntry;
  onPress: () => void;
};

export function InboxRow({ entry, onPress }: InboxRowProps) {
  const preview =
    entry.lastMessageText.trim() || "Henüz mesaj yok. İlk mesajı sen gönder.";

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center border-b px-4 py-3"
      style={{
        backgroundColor: messageTheme.rowBg,
        borderColor: messageTheme.border,
      }}
    >
      <ProfileAvatar
        size={48}
        photoURL={entry.otherPhotoURL}
        fallbackLetter={entry.otherDisplayName.slice(0, 1).toUpperCase()}
      />
      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className="flex-1 text-base font-semibold text-gray-900"
            numberOfLines={1}
          >
            {entry.otherDisplayName}
          </Text>
          <Text className="ml-2 text-xs text-gray-400">
            {formatListTime(entry.lastMessageAt)}
          </Text>
        </View>
        <View className="mt-0.5 flex-row items-center">
          <Text className="flex-1 text-sm text-gray-500" numberOfLines={1}>
            {preview}
          </Text>
          {entry.unreadCount > 0 ? (
            <View
              className="ml-2 min-h-[20px] min-w-[20px] items-center justify-center rounded-full px-1.5"
              style={{ backgroundColor: messageTheme.unreadBadge }}
            >
              <Text className="text-[11px] font-bold text-white">
                {entry.unreadCount > 99 ? "99+" : entry.unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

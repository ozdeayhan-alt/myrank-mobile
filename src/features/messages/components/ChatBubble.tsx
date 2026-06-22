import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import type { ChatMessage } from "../types";
import { messageTheme } from "../theme";

const CHAT_AVATAR_SIZE = 28;
const CHAT_AVATAR_GAP = 6;

function formatTime(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ChatBubbleProps = {
  message: ChatMessage;
  isMine: boolean;
  avatarPhotoURL?: string;
  avatarFallbackLetter?: string;
  showAvatar?: boolean;
};

function ChatVideoBubble({ uri }: { uri: string; posterURL?: string }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
    instance.muted = false;
  });

  return (
    <VideoView
      player={player}
      style={{ width: 220, height: 280, borderRadius: 12 }}
      contentFit="cover"
      nativeControls
    />
  );
}

export function ChatBubble({
  message,
  isMine,
  avatarPhotoURL,
  avatarFallbackLetter = "?",
  showAvatar = true,
}: ChatBubbleProps) {
  const isMedia = message.type === "image" || message.type === "video";

  const avatarSlot = (
    <View
      style={{
        width: CHAT_AVATAR_SIZE,
        marginRight: isMine ? 0 : CHAT_AVATAR_GAP,
        marginLeft: isMine ? CHAT_AVATAR_GAP : 0,
        alignSelf: "flex-end",
      }}
    >
      {showAvatar ? (
        <ProfileAvatar
          size={CHAT_AVATAR_SIZE}
          photoURL={avatarPhotoURL}
          fallbackLetter={avatarFallbackLetter}
        />
      ) : null}
    </View>
  );

  return (
    <View
      className={`flex-row ${showAvatar ? "mb-2" : "mb-0.5"} max-w-[88%] ${
        isMine ? "self-end" : "self-start"
      }`}
    >
      {!isMine ? avatarSlot : null}
      <View
        className="shrink rounded-2xl px-3 py-2"
        style={{
          backgroundColor: isMine
            ? messageTheme.sentBubble
            : messageTheme.receivedBubble,
          borderWidth: isMine ? 0 : 1,
          borderColor: messageTheme.border,
          borderBottomRightRadius: isMine ? 4 : 16,
          borderBottomLeftRadius: isMine ? 16 : 4,
          ...(isMedia ? { padding: 4 } : null),
        }}
      >
        {message.type === "image" && message.mediaURL ? (
          <Image
            source={{ uri: message.mediaURL }}
            style={{ width: 220, height: 220, borderRadius: 12 }}
            contentFit="cover"
          />
        ) : null}

        {message.type === "video" && message.mediaURL ? (
          <ChatVideoBubble
            uri={message.mediaURL}
            posterURL={message.posterURL}
          />
        ) : null}

        {message.text ? (
          <Text
            className="text-[15px] leading-5"
            style={{
              color: isMine ? messageTheme.sentText : messageTheme.receivedText,
              ...(isMedia ? { marginTop: 6, paddingHorizontal: 4 } : null),
            }}
          >
            {message.text}
          </Text>
        ) : null}

        {message.type === "text" ? (
          <Text
            className="mt-1 self-end text-[10px]"
            style={{
              color: isMine ? messageTheme.sentTime : messageTheme.receivedTime,
            }}
          >
            {formatTime(message.createdAt)}
          </Text>
        ) : (
          <Text
            className="mt-1 self-end px-1 text-[10px]"
            style={{
              color: isMine ? messageTheme.sentTime : messageTheme.receivedTime,
            }}
          >
            {formatTime(message.createdAt)}
          </Text>
        )}
      </View>
      {isMine ? avatarSlot : null}
    </View>
  );
}

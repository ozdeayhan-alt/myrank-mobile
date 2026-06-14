import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import type { ChatMessage } from "../types";
import { messageTheme } from "../theme";

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

export function ChatBubble({ message, isMine }: ChatBubbleProps) {
  const isMedia = message.type === "image" || message.type === "video";

  return (
    <View className={`mb-2 max-w-[82%] ${isMine ? "self-end" : "self-start"}`}>
      <View
        className="rounded-2xl px-3 py-2"
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
    </View>
  );
}

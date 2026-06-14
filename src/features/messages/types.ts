export type MessageMediaType = "image" | "video";

export type MessageType = "text" | MessageMediaType;

export type InboxEntry = {
  conversationId: string;
  otherUserId: string;
  otherDisplayName: string;
  otherPhotoURL?: string;
  lastMessageText: string;
  lastMessageAt: Date | null;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  type: MessageType;
  text?: string;
  mediaURL?: string;
  posterURL?: string;
  createdAt: Date | null;
};

export type SendMessageInput =
  | { type?: "text"; text: string }
  | {
      type: MessageMediaType;
      mediaURL: string;
      posterURL?: string;
      text?: string;
    };

export type OpenConversationResult = {
  ok: boolean;
  conversationId: string;
  otherUser: {
    userId: string;
    displayName: string;
    photoURL?: string;
  };
};

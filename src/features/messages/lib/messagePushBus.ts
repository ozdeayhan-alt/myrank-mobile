type MessagePushListener = (conversationId: string) => void;

const listeners = new Set<MessagePushListener>();

export function subscribeMessagePush(listener: MessagePushListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitMessagePush(conversationId: string): void {
  const trimmed = conversationId.trim();
  if (!trimmed) {
    return;
  }

  for (const listener of listeners) {
    listener(trimmed);
  }
}

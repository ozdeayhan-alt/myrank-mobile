import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { ChatMessage } from "../types";

function mapMessageType(value: unknown): ChatMessage["type"] {
  if (value === "image" || value === "video") {
    return value;
  }
  return "text";
}

function mapMessageDoc(id: string, data: Record<string, unknown>): ChatMessage {
  const type = mapMessageType(data.type);
  const text =
    typeof data.text === "string" && data.text.trim()
      ? data.text.trim()
      : undefined;

  return {
    id,
    senderId: String(data.senderId ?? ""),
    type,
    ...(text ? { text } : {}),
    ...(typeof data.mediaURL === "string" && data.mediaURL.trim()
      ? { mediaURL: data.mediaURL.trim() }
      : {}),
    ...(typeof data.posterURL === "string" && data.posterURL.trim()
      ? { posterURL: data.posterURL.trim() }
      : {}),
    createdAt:
      data.createdAt &&
      typeof (data.createdAt as { toDate?: () => Date }).toDate === "function"
        ? (data.createdAt as { toDate: () => Date }).toDate()
        : null,
  };
}

export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(getFirestoreDb(), "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMessages(
          snapshot.docs.map((doc) =>
            mapMessageDoc(doc.id, doc.data() as Record<string, unknown>)
          )
        );
        setLoading(false);
      },
      (err) => {
        setError(err.message ?? "Mesajlar yüklenemedi");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [conversationId]);

  return { messages, loading, error };
}

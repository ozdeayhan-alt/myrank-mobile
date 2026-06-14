import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useAuth } from "@/features/auth";
import { getFirestoreDb } from "@/lib/firebase";
import type { InboxEntry } from "../types";

function mapInboxDoc(id: string, data: Record<string, unknown>): InboxEntry {
  return {
    conversationId: id,
    otherUserId: String(data.otherUserId ?? ""),
    otherDisplayName: String(data.otherDisplayName ?? "Kullanıcı"),
    otherPhotoURL: data.otherPhotoURL ? String(data.otherPhotoURL) : undefined,
    lastMessageText: String(data.lastMessageText ?? ""),
    lastMessageAt:
      data.lastMessageAt &&
      typeof (data.lastMessageAt as { toDate?: () => Date }).toDate === "function"
        ? (data.lastMessageAt as { toDate: () => Date }).toDate()
        : null,
    unreadCount:
      typeof data.unreadCount === "number" ? Math.max(0, data.unreadCount) : 0,
  };
}

export function useInbox() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<InboxEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(getFirestoreDb(), "users", user.uid, "inbox"),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const next = snapshot.docs.map((doc) =>
          mapInboxDoc(doc.id, doc.data() as Record<string, unknown>)
        );
        setEntries(next);
        setLoading(false);
      },
      (err) => {
        setError(err.message ?? "Mesajlar yüklenemedi");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  return { entries, loading, error };
}

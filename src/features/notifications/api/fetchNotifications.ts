import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import type { AppNotification } from "../types";
import { mapNotification } from "./mapNotification";

const DEFAULT_NOTIFICATION_LIMIT = 10;

export async function fetchNotifications(
  userId: string,
  options?: { limit?: number }
): Promise<AppNotification[]> {
  const pageLimit = options?.limit ?? DEFAULT_NOTIFICATION_LIMIT;
  const q = query(
    collection(getFirestoreDb(), "users", userId, "notifications"),
    orderBy("createdAt", "desc"),
    limit(pageLimit)
  );

  const snap = await getDocs(q);
  const items: AppNotification[] = [];

  for (const docSnap of snap.docs) {
    const mapped = mapNotification(docSnap.id, docSnap.data());
    if (mapped) {
      items.push(mapped);
    }
  }

  return items;
}

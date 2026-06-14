import { doc, getDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type OfficialSegmentRankResult = {
  rank: number | null;
};

/**
 * Yalnızca gece job veya ensure ile yazılmış resmi sıra.
 * Gün içi TP değişse bile entry.rank sabit kalır; tahmini sıra hesaplanmaz.
 */
export async function resolveOfficialSegmentRank(
  segmentKey: string,
  userId: string
): Promise<OfficialSegmentRankResult> {
  const entrySnap = await getDoc(
    doc(getFirestoreDb(), "rankings", segmentKey, "entries", userId)
  );

  if (!entrySnap.exists()) {
    return { rank: null };
  }

  const data = entrySnap.data();
  const rank = typeof data.rank === "number" ? data.rank : null;
  return { rank };
}

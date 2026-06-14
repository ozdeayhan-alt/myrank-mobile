import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type SegmentRankResult = {
  rank: number | null;
  totalInSegment: number;
  isOfficial: boolean;
};

/**
 * Resmi sıra: entry.rank + entry.segmentTotal.
 * Yoksa segmentte TP'ye göre tahmini sıra (gün içi; resmi değil).
 */
export async function resolveSegmentRank(
  segmentKey: string,
  userId: string
): Promise<SegmentRankResult> {
  const entryRef = doc(
    getFirestoreDb(),
    "rankings",
    segmentKey,
    "entries",
    userId
  );
  const entrySnap = await getDoc(entryRef);
  const coll = collection(
    getFirestoreDb(),
    "rankings",
    segmentKey,
    "entries"
  );

  if (!entrySnap.exists()) {
    return { rank: null, totalInSegment: 0, isOfficial: false };
  }

  const data = entrySnap.data();
  const storedRank = typeof data.rank === "number" ? data.rank : null;
  const storedTotal =
    typeof data.segmentTotal === "number" ? data.segmentTotal : 0;

  if (storedRank !== null && storedTotal > 0) {
    return {
      rank: storedRank,
      totalInSegment: storedTotal,
      isOfficial: true,
    };
  }

  const totalScore =
    typeof data.totalScore === "number" ? data.totalScore : 0;

  try {
    const [totalSnap, higherSnap] = await Promise.all([
      getCountFromServer(query(coll)),
      getCountFromServer(
        query(coll, where("totalScore", ">", totalScore))
      ),
    ]);

    const totalInSegment = totalSnap.data().count;
    const higherCount = higherSnap.data().count;

    if (totalInSegment === 0) {
      return { rank: null, totalInSegment: 0, isOfficial: false };
    }

    return {
      rank: higherCount + 1,
      totalInSegment,
      isOfficial: false,
    };
  } catch {
    return { rank: storedRank, totalInSegment: storedTotal, isOfficial: false };
  }
}

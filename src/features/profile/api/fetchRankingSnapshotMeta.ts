import { doc, getDoc, Timestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type RankingSnapshotMeta = {
  rebuiltAt: Date | null;
  timezone: string | null;
};

export async function fetchRankingSnapshotMeta(): Promise<RankingSnapshotMeta> {
  const snap = await getDoc(
    doc(getFirestoreDb(), "rankingSnapshots", "latest")
  );

  if (!snap.exists()) {
    return { rebuiltAt: null, timezone: null };
  }

  const data = snap.data();
  const rebuiltAtRaw = data.rebuiltAt;

  let rebuiltAt: Date | null = null;
  if (rebuiltAtRaw instanceof Timestamp) {
    rebuiltAt = rebuiltAtRaw.toDate();
  } else if (
    rebuiltAtRaw &&
    typeof rebuiltAtRaw === "object" &&
    "seconds" in rebuiltAtRaw
  ) {
    rebuiltAt = new Date((rebuiltAtRaw as { seconds: number }).seconds * 1000);
  }

  return {
    rebuiltAt,
    timezone:
      typeof data.timezone === "string" ? data.timezone : "Europe/Istanbul",
  };
}

export function formatOfficialRankUpdatedAt(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

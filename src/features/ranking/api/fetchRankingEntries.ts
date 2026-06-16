import {
  collection,
  getDocs,
  getDocsFromServer,
  limit,
  orderBy,
  query,
  type Query,
} from "firebase/firestore";
import {
  buildSegmentKey,
  DEFAULT_DISPLAY_NAME,
  isMetadataComplete,
  type UserMetadata,
} from "@/features/profile/types";
import { GLOBAL_RANKING_SEGMENT } from "@/features/filters/constants";
import {
  buildSingleFieldSegmentKey,
  entryMatchesSegmentFilters,
} from "@/features/filters/utils/segmentLabel";
import { hasActiveSegmentFilters } from "@/features/posts/api/matchesSegmentFilters";
import { getFirestoreDb } from "@/lib/firebase";
import { normalizeAvatarUrl } from "@/lib/media/normalizeAvatarUrl";
import { parsePostMetadata } from "@/features/posts/api/parsePostMetadata";
import type { RankingEntry, RankingTrendLabel } from "../types";

const GLOBAL_FETCH_CAP = 100;

function parseTrendLabel(value: unknown): RankingTrendLabel {
  if (value === "rising" || value === "falling" || value === "stable") {
    return value;
  }
  return null;
}

function parseOptionalNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function mapEntryDoc(
  docSnap: { id: string; data: () => Record<string, unknown> },
  fallbackRank: number
): RankingEntry {
  const data = docSnap.data();
  const displayName =
    typeof data.displayName === "string" && data.displayName.trim()
      ? data.displayName.trim()
      : DEFAULT_DISPLAY_NAME;

  return {
    userId: docSnap.id,
    displayName,
    totalScore: typeof data.totalScore === "number" ? data.totalScore : 0,
    rank: typeof data.rank === "number" ? data.rank : fallbackRank,
    metadata: parsePostMetadata({ metadata: data.metadata }),
    photoURL: (() => {
      const normalized = normalizeAvatarUrl(
        typeof data.photoURL === "string" ? data.photoURL : undefined
      );
      return normalized || undefined;
    })(),
    previousRank: parseOptionalNumber(data.previousRank),
    rankChange: parseOptionalNumber(data.rankChange),
    previousTotalScore: parseOptionalNumber(data.previousTotalScore),
    tpChange: parseOptionalNumber(data.tpChange),
    trendLabel: parseTrendLabel(data.trendLabel),
  };
}

async function runRankingQuery(q: Query) {
  try {
    return await getDocsFromServer(q);
  } catch {
    return await getDocs(q);
  }
}

async function fetchRankingsFromSegment(
  segmentKey: string,
  max: number
): Promise<RankingEntry[]> {
  const q = query(
    collection(getFirestoreDb(), "rankings", segmentKey, "entries"),
    orderBy("totalScore", "desc"),
    limit(max)
  );
  const snapshot = await runRankingQuery(q);
  return snapshot.docs.map((docSnap, index) =>
    mapEntryDoc(docSnap, index + 1)
  );
}

/**
 * Global First: null/boş → rankings/global/entries.
 * Tam veya tek alan filtre → ilgili segment koleksiyonu.
 * Çoklu kısmi filtre → global çekip client-side eşleştirme.
 */
export async function fetchRankingEntries(
  filters: UserMetadata | null,
  max = 50
): Promise<RankingEntry[]> {
  if (!filters || !hasActiveSegmentFilters(filters)) {
    return fetchRankingsFromSegment(GLOBAL_RANKING_SEGMENT, max);
  }

  if (isMetadataComplete(filters)) {
    return fetchRankingsFromSegment(buildSegmentKey(filters), max);
  }

  const singleKey = buildSingleFieldSegmentKey(filters);
  if (singleKey) {
    return fetchRankingsFromSegment(singleKey, max);
  }

  const globalRows = await fetchRankingsFromSegment(
    GLOBAL_RANKING_SEGMENT,
    GLOBAL_FETCH_CAP
  );

  return globalRows
    .filter((row) => entryMatchesSegmentFilters(row.metadata, filters))
    .slice(0, max)
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      rankChange: null,
      trendLabel: null,
    }));
}

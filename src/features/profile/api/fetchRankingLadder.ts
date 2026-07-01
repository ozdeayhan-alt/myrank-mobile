import { GLOBAL_RANKING_SEGMENT } from "@/features/filters/constants";
import { getApiBaseUrl } from "@/lib/api";
import { fetchApi } from "@/lib/fetchApi";

export type LadderRung = {
  rank: number;
  totalScore: number;
};

export type RankingLadderResult = {
  snapshotScore: number;
  myRank: number | null;
  aheadRungs: LadderRung[];
  behindRungs: LadderRung[];
};

/** Gauge merdiven fetch üst sınırı (yüksek resmi sıralarda pencere). */
export const RANKING_LADDER_MAX_RUNGS = 100;

/** Gauge bar ince ayarı için yeterli komşu rung sayısı. */
export const GAUGE_LADDER_MAX_RUNGS = 12;

function immediateAheadFromEntry(
  entryData: Record<string, unknown>
): LadderRung | null {
  const aheadRank =
    typeof entryData.aheadRank === "number" ? entryData.aheadRank : null;
  const aheadTotalScore =
    typeof entryData.aheadTotalScore === "number"
      ? entryData.aheadTotalScore
      : null;
  if (aheadRank === null || aheadTotalScore === null || aheadRank <= 0) {
    return null;
  }
  return { rank: aheadRank, totalScore: aheadTotalScore };
}

function immediateBehindFromEntry(
  entryData: Record<string, unknown>
): LadderRung | null {
  const behindRank =
    typeof entryData.behindRank === "number" ? entryData.behindRank : null;
  const behindTotalScore =
    typeof entryData.behindTotalScore === "number"
      ? entryData.behindTotalScore
      : null;
  if (
    behindRank === null ||
    behindTotalScore === null ||
    behindRank <= 0
  ) {
    return null;
  }
  return { rank: behindRank, totalScore: behindTotalScore };
}

function buildSnapshotFromEntry(
  entryData: Record<string, unknown> | null
): RankingLadderResult {
  if (!entryData) {
    return {
      snapshotScore: 0,
      myRank: null,
      aheadRungs: [],
      behindRungs: [],
    };
  }

  const snapshotScore =
    typeof entryData.totalScore === "number" ? entryData.totalScore : 0;
  const myRank = typeof entryData.rank === "number" ? entryData.rank : null;
  const aheadImmediate = immediateAheadFromEntry(entryData);
  const behindImmediate = immediateBehindFromEntry(entryData);

  return {
    snapshotScore,
    myRank,
    aheadRungs: aheadImmediate ? [aheadImmediate] : [],
    behindRungs: behindImmediate ? [behindImmediate] : [],
  };
}

async function readSegmentEntryCached(
  segmentKey: string,
  userId: string
): Promise<Record<string, unknown> | null> {
  const params = new URLSearchParams({ segmentKey });
  const response = await fetchApi(
    `${getApiBaseUrl()}/api/profile/${encodeURIComponent(userId)}/ranking-entry?${params.toString()}`,
    { method: "GET", timeoutMs: 15_000 }
  );

  const data = (await response.json()) as {
    ok: boolean;
    entry: Record<string, unknown> | null;
  };

  if (!response.ok || !data.entry) {
    return null;
  }

  return data.entry;
}

/**
 * Fallback when profile summary seed is unavailable.
 */
export async function fetchRankingLadderSnapshot(
  userId: string,
  segmentKey: string = GLOBAL_RANKING_SEGMENT,
  hintRank?: number | null
): Promise<RankingLadderResult> {
  const entryData = await readSegmentEntryCached(segmentKey, userId);
  const base = buildSnapshotFromEntry(entryData);

  if (
    base.myRank === null &&
    hintRank != null &&
    hintRank > 0 &&
    entryData
  ) {
    return { ...base, myRank: hintRank };
  }

  return base;
}

/** Tam merdiven — backend API. */
export async function fetchRankingLadderFull(
  userId: string,
  segmentKey: string = GLOBAL_RANKING_SEGMENT,
  hintRank?: number | null,
  maxRungs?: number | null
): Promise<RankingLadderResult> {
  const params = new URLSearchParams();
  params.set("segmentKey", segmentKey);
  if (hintRank != null && hintRank > 0) {
    params.set("hintRank", String(hintRank));
  }
  if (maxRungs != null && maxRungs > 0) {
    params.set("maxRungs", String(maxRungs));
  }

  const response = await fetchApi(
    `${getApiBaseUrl()}/api/profile/${encodeURIComponent(userId)}/ladder?${params.toString()}`,
    {
      method: "GET",
      timeoutMs: 20_000,
    }
  );

  const data = (await response.json()) as {
    ok: boolean;
    ladder: RankingLadderResult;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Ladder request failed");
  }

  return data.ladder;
}

/** @deprecated Use snapshot + full split */
export async function fetchRankingLadder(
  userId: string,
  segmentKey: string = GLOBAL_RANKING_SEGMENT
): Promise<RankingLadderResult> {
  return fetchRankingLadderFull(userId, segmentKey);
}

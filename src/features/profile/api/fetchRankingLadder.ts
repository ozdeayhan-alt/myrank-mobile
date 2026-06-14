import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  limit,
  orderBy,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";
import { GLOBAL_RANKING_SEGMENT } from "@/features/filters/constants";
import { getFirestoreDb } from "@/lib/firebase";

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

/** Gauge animasyonu için yeterli basamak; tam liste değil. */
export const RANKING_LADDER_MAX_RUNGS = 20;

function globalEntryRef(userId: string) {
  return doc(
    getFirestoreDb(),
    "rankings",
    GLOBAL_RANKING_SEGMENT,
    "entries",
    userId
  );
}

function globalEntriesCollection() {
  return collection(
    getFirestoreDb(),
    "rankings",
    GLOBAL_RANKING_SEGMENT,
    "entries"
  );
}

function readRung(data: DocumentData): LadderRung | null {
  const rank = typeof data.rank === "number" ? data.rank : null;
  const totalScore =
    typeof data.totalScore === "number" ? data.totalScore : null;
  if (rank === null || totalScore === null || rank <= 0) {
    return null;
  }
  return { rank, totalScore };
}

async function readGlobalEntryCached(
  userId: string
): Promise<DocumentData | null> {
  const snap = await getDoc(globalEntryRef(userId));
  return snap.exists() ? snap.data() : null;
}

async function readGlobalEntryFresh(
  userId: string
): Promise<DocumentData | null> {
  try {
    const snap = await getDocFromServer(globalEntryRef(userId));
    return snap.exists() ? snap.data() : null;
  } catch {
    return readGlobalEntryCached(userId);
  }
}

async function runDocsQuery(q: ReturnType<typeof query>) {
  try {
    return await getDocsFromServer(q);
  } catch {
    return await getDocs(q);
  }
}

function immediateAheadFromEntry(
  entryData: DocumentData
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
  entryData: DocumentData
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
  entryData: DocumentData | null
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

/**
 * Hızlı ilk paint — tek doc, cache-first; Önündeki/Arkandaki snapshot alanları.
 */
export async function fetchRankingLadderSnapshot(
  userId: string
): Promise<RankingLadderResult> {
  const entryData = await readGlobalEntryCached(userId);
  return buildSnapshotFromEntry(entryData);
}

async function fetchRungsByRank(
  myRank: number,
  direction: "ahead" | "behind"
): Promise<LadderRung[]> {
  const coll = globalEntriesCollection();

  if (direction === "ahead") {
    const q = query(
      coll,
      where("rank", "<", myRank),
      orderBy("rank", "desc"),
      limit(RANKING_LADDER_MAX_RUNGS)
    );
    const snap = await runDocsQuery(q);
    return snap.docs
      .map((docSnap) => readRung(docSnap.data() as DocumentData))
      .filter((rung): rung is LadderRung => rung !== null);
  }

  const q = query(
    coll,
    where("rank", ">", myRank),
    orderBy("rank", "asc"),
    limit(RANKING_LADDER_MAX_RUNGS)
  );
  const snap = await runDocsQuery(q);
  return snap.docs
    .map((docSnap) => readRung(docSnap.data() as DocumentData))
    .filter((rung): rung is LadderRung => rung !== null);
}

async function fetchRungsByTotalScoreOrder(
  myRank: number,
  direction: "ahead" | "behind"
): Promise<LadderRung[]> {
  const coll = globalEntriesCollection();

  if (direction === "ahead") {
    const q = query(coll, orderBy("totalScore", "desc"), limit(myRank));
    const snap = await runDocsQuery(q);
    return snap.docs
      .slice(0, Math.max(0, myRank - 1))
      .reverse()
      .map((docSnap) => readRung(docSnap.data() as DocumentData))
      .filter((rung): rung is LadderRung => rung !== null)
      .slice(0, RANKING_LADDER_MAX_RUNGS);
  }

  const q = query(
    coll,
    orderBy("totalScore", "desc"),
    limit(myRank + RANKING_LADDER_MAX_RUNGS)
  );
  const snap = await runDocsQuery(q);
  return snap.docs
    .slice(myRank)
    .map((docSnap) => readRung(docSnap.data() as DocumentData))
    .filter((rung): rung is LadderRung => rung !== null)
    .slice(0, RANKING_LADDER_MAX_RUNGS);
}

/**
 * Tam merdiven — arka planda; rank sorguları + fallback.
 */
export async function fetchRankingLadderFull(
  userId: string
): Promise<RankingLadderResult> {
  const entryData = await readGlobalEntryFresh(userId);
  const base = buildSnapshotFromEntry(entryData);

  if (!entryData || base.myRank === null) {
    return base;
  }

  const myRank = base.myRank;
  let aheadRungs: LadderRung[] = [];
  let behindRungs: LadderRung[] = [];

  try {
    [aheadRungs, behindRungs] = await Promise.all([
      myRank > 1 ? fetchRungsByRank(myRank, "ahead") : Promise.resolve([]),
      fetchRungsByRank(myRank, "behind"),
    ]);
  } catch (error) {
    console.warn("[fetchRankingLadderFull] rank query failed, fallback:", error);
  }

  if (myRank > 1 && aheadRungs.length === 0) {
    try {
      aheadRungs = await fetchRungsByTotalScoreOrder(myRank, "ahead");
    } catch (error) {
      console.warn("[fetchRankingLadderFull] ahead score fallback failed:", error);
      aheadRungs = base.aheadRungs;
    }
  }

  if (behindRungs.length === 0) {
    try {
      behindRungs = await fetchRungsByTotalScoreOrder(myRank, "behind");
    } catch (error) {
      console.warn("[fetchRankingLadderFull] behind score fallback failed:", error);
      behindRungs = base.behindRungs;
    }
  }

  return {
    snapshotScore: base.snapshotScore,
    myRank,
    aheadRungs,
    behindRungs,
  };
}

/** @deprecated Use snapshot + full split */
export async function fetchRankingLadder(
  userId: string
): Promise<RankingLadderResult> {
  return fetchRankingLadderFull(userId);
}

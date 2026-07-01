import type { CategoryRanking } from "../api/fetchProfileRankings";
import { EMPTY_METADATA } from "../types";
import {
  buildGaugeSegmentCandidate,
  pickClosestGaugeSegment,
  isGaugeAtPinnacle,
  isGaugeAtGlobalLast,
} from "./pickClosestGaugeSegment";

describe("pickClosestGaugeSegment", () => {
  const metadata = { ...EMPTY_METADATA, city: "İzmir", profession: "Öğrenci" };

  function candidateWithRungs(
    key: CategoryRanking["key"],
    rank: number,
    displayScore: number,
    aheadRungs: Array<{ rank: number; totalScore: number }>,
    behindRungs: Array<{ rank: number; totalScore: number }> = []
  ) {
    const ranking = { key, rank, isOfficial: true } as CategoryRanking & {
      rank: number;
    };
    return buildGaugeSegmentCandidate(
      ranking,
      metadata,
      {
        snapshotScore: displayScore,
        myRank: rank,
        aheadRungs,
        behindRungs,
      },
      displayScore
    );
  }

  function candidate(
    key: CategoryRanking["key"],
    rank: number,
    aheadScore: number,
    aheadRank: number,
    displayScore: number
  ) {
    return candidateWithRungs(
      key,
      rank,
      displayScore,
      [{ rank: aheadRank, totalScore: aheadScore }]
    );
  }

  it("picks segment with smallest remaining points on up", () => {
    const izmir = candidate("city", 8, 1015, 7, 1000);
    const ogrenci = candidate("profession", 3, 1200, 2, 1000);

    expect(pickClosestGaugeSegment([ogrenci, izmir], "up")?.key).toBe("city");
    expect(pickClosestGaugeSegment([ogrenci, izmir], "up")?.remainingUp).toBe(15);
  });

  it("detects pinnacle when global rank is 1 and no up targets", () => {
    expect(isGaugeAtPinnacle(1, "up", null)).toBe(true);
    expect(isGaugeAtPinnacle(2, "up", null)).toBe(false);
  });

  it("cascades to next category when current segment up targets are exhausted", () => {
    const yazarExhausted = candidateWithRungs(
      "profession",
      7,
      1031,
      [{ rank: 6, totalScore: 1000 }],
      []
    );
    const global = candidateWithRungs(
      "global",
      117,
      1031,
      [
        { rank: 116, totalScore: 1040 },
        { rank: 115, totalScore: 1050 },
      ],
      []
    );

    expect(yazarExhausted.hasUpTarget).toBe(false);
    expect(yazarExhausted.remainingUp).toBe(Number.POSITIVE_INFINITY);
    expect(pickClosestGaugeSegment([yazarExhausted, global], "up")?.key).toBe(
      "global"
    );
    expect(
      pickClosestGaugeSegment([yazarExhausted, global], "up")?.remainingUp
    ).toBe(9);
  });

  it("detects global last when no down targets remain in global segment", () => {
    const global = candidateWithRungs("global", 500, 100, [], []);
    expect(isGaugeAtGlobalLast("down", null, global)).toBe(true);
    expect(isGaugeAtGlobalLast("down", global, global)).toBe(true);
  });

  it("prefers bekar 68 over age 1 when bekar has fewer remaining points", () => {
    const bekar = candidateWithRungs(
      "maritalStatus",
      69,
      1000,
      [
        { rank: 68, totalScore: 1015 },
        { rank: 67, totalScore: 1100 },
      ],
      []
    );
    const age = candidateWithRungs(
      "age",
      2,
      1000,
      [{ rank: 1, totalScore: 4772 }],
      []
    );

    expect(bekar.targetRankUp).toBe(68);
    expect(bekar.remainingUp).toBe(15);
    expect(pickClosestGaugeSegment([age, bekar], "up")?.key).toBe(
      "maritalStatus"
    );
  });

  it("walks official rank chain when live score passed immediate ahead frozen score", () => {
    const bekar = candidateWithRungs(
      "maritalStatus",
      69,
      1020,
      [
        { rank: 68, totalScore: 1010 },
        { rank: 67, totalScore: 1030 },
      ],
      []
    );

    expect(bekar.targetRankUp).toBe(67);
    expect(bekar.remainingUp).toBe(10);
  });

  it("drops segment when frozen ahead scores are all passed", () => {
    const profession = candidateWithRungs(
      "profession",
      7,
      1050,
      [{ rank: 6, totalScore: 1000 }],
      []
    );

    expect(profession.hasUpTarget).toBe(false);
    expect(profession.targetRankUp).toBeNull();
    expect(pickClosestGaugeSegment([profession], "up")?.key).toBe("profession");
    expect(pickClosestGaugeSegment([profession], "up")?.hasUpTarget).toBe(false);
  });

  it("prefers city snapshot over profession when city needs fewer TP on equal snapshot data", () => {
    const yazar = candidateWithRungs(
      "profession",
      5,
      1500,
      [{ rank: 4, totalScore: 2000 }],
      []
    );
    const izmir = candidateWithRungs(
      "city",
      12,
      1500,
      [{ rank: 11, totalScore: 1520 }],
      []
    );

    expect(yazar.remainingUp).toBe(500);
    expect(izmir.remainingUp).toBe(20);
    expect(pickClosestGaugeSegment([yazar, izmir], "up")?.key).toBe("city");
  });
});

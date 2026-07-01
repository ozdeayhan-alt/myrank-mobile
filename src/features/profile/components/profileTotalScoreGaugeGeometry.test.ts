import {
  computeGaugeProgress,
  computeLadderGaugeProgress,
  computeRemainingPointsUp,
  describeHorizontalBar,
  describeUpperSemicircleArc,
  getUpperSemicirclePeakY,
  pickActiveAheadRung,
  pickActiveAheadRungByOfficialRank,
  pickActiveBehindRung,
  pointOnHorizontalBar,
  pointOnUpperSemicircle,
} from "./profileTotalScoreGaugeGeometry";

describe("profileTotalScoreGaugeGeometry", () => {
  const cx = 84;
  const cy = 90;
  const radius = 68;

  it("curves upward: peak y is above chord baseline", () => {
    const peakY = getUpperSemicirclePeakY(cx, cy, radius);
    expect(peakY).toBeLessThan(cy);
    expect(peakY).toBeCloseTo(cy - radius, 0);
  });

  it("places chord endpoints on baseline with different x", () => {
    const left = pointOnUpperSemicircle(cx, cy, radius, 0);
    const right = pointOnUpperSemicircle(cx, cy, radius, 1);

    expect(left.y).toBeCloseTo(cy, 0);
    expect(right.y).toBeCloseTo(cy, 0);
    expect(left.x).toBeLessThan(cx);
    expect(right.x).toBeGreaterThan(cx);
  });

  it("builds a non-flat arc path for full semicircle", () => {
    const path = describeUpperSemicircleArc(cx, cy, radius, 0, 1);
    expect(path).toContain("A");
    expect(path).toContain("1");
    expect(path).toContain("M");
    expect(path.length).toBeGreaterThan(10);
  });

  it("places horizontal bar endpoints on baseline", () => {
    const barX = 2;
    const barY = 12;
    const barLength = 300;
    const left = pointOnHorizontalBar(barX, barY, barLength, 0);
    const right = pointOnHorizontalBar(barX, barY, barLength, 1);
    const mid = pointOnHorizontalBar(barX, barY, barLength, 0.5);

    expect(left).toEqual({ x: barX, y: barY });
    expect(right).toEqual({ x: barX + barLength, y: barY });
    expect(mid.x).toBeCloseTo(barX + barLength / 2, 0);
    expect(mid.y).toBe(barY);
  });

  it("builds a horizontal line path for energy bar", () => {
    const path = describeHorizontalBar(2, 12, 300);
    expect(path).toContain("M 2 12");
    expect(path).toContain("L 302 12");
  });

  it("computes leader progress as full arc", () => {
    const result = computeGaugeProgress({
      score: 4154,
      baselineScore: 4154,
      targetScore: null,
    });
    expect(result.isLeader).toBe(true);
    expect(result.progress).toBe(1);
  });

  it("computes remaining points as gap to ahead rival", () => {
    const result = computeGaugeProgress({
      score: 4154,
      baselineScore: 4154,
      targetScore: 4274,
      aheadRank: 47,
    });
    expect(result.remainingPoints).toBe(120);
    expect(result.neighborRank).toBe(47);
  });

  it("computes partial progress toward target", () => {
    const result = computeGaugeProgress({
      score: 3900,
      baselineScore: 3770,
      targetScore: 4120,
    });
    expect(result.hasTarget).toBe(true);
    expect(result.progress).toBeGreaterThan(0);
    expect(result.progress).toBeLessThan(1);
  });

  it("keeps ahead target for tied snapshot scores", () => {
    const result = computeGaugeProgress({
      score: 4154,
      baselineScore: 4154,
      targetScore: 4154,
      aheadRank: 46,
    });
    expect(result.hasTarget).toBe(true);
    expect(result.remainingPoints).toBe(0);
    expect(result.progress).toBe(1);
    expect(result.neighborRank).toBe(46);
  });

  it("advances up ladder when score passes ahead rung", () => {
    const aheadRungs = [
      { rank: 9, totalScore: 1100 },
      { rank: 8, totalScore: 1200 },
      { rank: 7, totalScore: 1300 },
    ];
    expect(pickActiveAheadRung(aheadRungs, 1050)?.rank).toBe(9);
    expect(pickActiveAheadRung(aheadRungs, 1100)?.rank).toBe(8);
    expect(pickActiveAheadRung(aheadRungs, 1250)?.rank).toBe(7);
    expect(pickActiveAheadRung(aheadRungs, 1300)).toBeNull();
  });

  it("walks from official rank minus one for up targets", () => {
    const aheadRungs = [
      { rank: 68, totalScore: 1010 },
      { rank: 67, totalScore: 1030 },
    ];
    expect(
      pickActiveAheadRungByOfficialRank(aheadRungs, 1000, 69)?.rank
    ).toBe(68);
    expect(
      pickActiveAheadRungByOfficialRank(aheadRungs, 1020, 69)?.rank
    ).toBe(67);
  });

  it("returns null when all window rungs are passed in official chain", () => {
    const aheadRungs = [
      { rank: 6, totalScore: 1000 },
      { rank: 5, totalScore: 900 },
    ];
    expect(pickActiveAheadRungByOfficialRank(aheadRungs, 1050, 7)).toBeNull();
  });

  it("skips missing ranks in official chain", () => {
    const aheadRungs = [
      { rank: 8, totalScore: 1100 },
      { rank: 7, totalScore: 1200 },
    ];
    expect(
      pickActiveAheadRungByOfficialRank(aheadRungs, 1000, 10)?.rank
    ).toBe(8);
  });

  it("uses official rank in ladder gauge progress", () => {
    const aheadRungs = [{ rank: 68, totalScore: 1015 }];
    const result = computeLadderGaugeProgress({
      score: 1000,
      baselineScore: 1000,
      direction: "up",
      aheadRungs,
      behindRungs: [],
      officialRank: 69,
    });
    expect(result.neighborRank).toBe(68);
    expect(result.remainingPoints).toBe(15);
  });

  it("computes up ladder from rank 10 toward leader", () => {
    const aheadRungs = [
      { rank: 9, totalScore: 1100 },
      { rank: 8, totalScore: 1200 },
    ];
    const atStart = computeLadderGaugeProgress({
      score: 1000,
      baselineScore: 1000,
      direction: "up",
      aheadRungs,
      behindRungs: [],
      officialRank: 10,
    });
    expect(atStart.neighborRank).toBe(9);
    expect(atStart.remainingPoints).toBe(100);

    const passedFirst = computeLadderGaugeProgress({
      score: 1100,
      baselineScore: 1000,
      direction: "up",
      aheadRungs,
      behindRungs: [],
      officialRank: 10,
    });
    expect(passedFirst.neighborRank).toBe(8);
    expect(passedFirst.remainingPoints).toBe(100);
  });

  it("advances down ladder when score drops below behind rung", () => {
    const behindRungs = [
      { rank: 11, totalScore: 900 },
      { rank: 12, totalScore: 850 },
    ];
    expect(pickActiveBehindRung(behindRungs, 1000)?.rank).toBe(11);
    expect(pickActiveBehindRung(behindRungs, 900)?.rank).toBe(12);
    expect(pickActiveBehindRung(behindRungs, 850)).toBeNull();
  });

  it("does not treat exhausted window as leader when official rank > 1", () => {
    const aheadRungs = [
      { rank: 55, totalScore: 1000 },
      { rank: 54, totalScore: 1010 },
    ];
    const result = computeLadderGaugeProgress({
      score: 1100,
      baselineScore: 900,
      direction: "up",
      aheadRungs,
      behindRungs: [],
      officialRank: 56,
    });
    expect(result.isLeader).toBe(false);
    expect(result.activeRung).toBeNull();
  });

  it("computes down ladder remaining points", () => {
    const behindRungs = [{ rank: 11, totalScore: 970 }];
    const result = computeLadderGaugeProgress({
      score: 1000,
      baselineScore: 1000,
      direction: "down",
      aheadRungs: [],
      behindRungs,
    });
    expect(result.neighborRank).toBe(11);
    expect(result.remainingPoints).toBe(30);
    expect(result.isLast).toBe(false);
  });
});

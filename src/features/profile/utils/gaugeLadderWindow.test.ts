import {
  computeSlidingLadderAnchor,
  getLowestAheadRungRank,
  isAheadLadderWindowExhausted,
} from "./gaugeLadderWindow";

describe("gaugeLadderWindow", () => {
  it("finds lowest ahead rung rank in window", () => {
    const rungs = [
      { rank: 55, totalScore: 1000 },
      { rank: 50, totalScore: 1100 },
      { rank: 44, totalScore: 1200 },
    ];
    expect(getLowestAheadRungRank(rungs)).toBe(44);
  });

  it("detects exhausted ahead window", () => {
    const rungs = [
      { rank: 55, totalScore: 1000 },
      { rank: 54, totalScore: 1010 },
    ];
    expect(isAheadLadderWindowExhausted(rungs, 999)).toBe(false);
    expect(isAheadLadderWindowExhausted(rungs, 1010)).toBe(true);
  });

  it("computes next anchor when window is passed", () => {
    const rungs = [
      { rank: 55, totalScore: 1000 },
      { rank: 54, totalScore: 1010 },
      { rank: 44, totalScore: 1200 },
    ];
    expect(computeSlidingLadderAnchor(rungs, 56, 1300)).toBe(44);
  });

  it("does not slide when a target remains in window", () => {
    const rungs = [
      { rank: 55, totalScore: 1000 },
      { rank: 54, totalScore: 1100 },
    ];
    expect(computeSlidingLadderAnchor(rungs, 56, 1050)).toBeNull();
  });

  it("does not slide past rank 1", () => {
    const rungs = [{ rank: 1, totalScore: 5000 }];
    expect(computeSlidingLadderAnchor(rungs, 2, 6000)).toBeNull();
  });
});

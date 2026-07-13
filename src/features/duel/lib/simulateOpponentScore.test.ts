import { simulateOpponentScores } from "./simulateOpponentScore";

describe("simulateOpponentScores", () => {
  it("ramps with elapsed time", () => {
    const early = simulateOpponentScores(1000, 0, 0, "match-1");
    const late = simulateOpponentScores(8000, 0, 0, "match-1");
    expect(late.scoreA + late.scoreB).toBeGreaterThan(early.scoreA + early.scoreB);
  });

  it("counters user-favored side", () => {
    const favorA = simulateOpponentScores(5000, 12, 2, "match-2");
    expect(favorA.scoreB).toBeGreaterThanOrEqual(favorA.scoreA);
  });
});

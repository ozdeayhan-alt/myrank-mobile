import {
  getProfileScoreCardWidth,
  getProfileVoteControlLayout,
  PROFILE_HORIZONTAL_PADDING,
} from "./profileLayout";

describe("getProfileVoteControlLayout", () => {
  it("uses max diameters on wide screens", () => {
    const layout = getProfileVoteControlLayout(412);

    expect(layout.stacked).toBe(false);
    expect(layout.voteDiameter).toBe(72);
    expect(layout.sideDiameter).toBe(64);
  });

  it("scales down on narrow screens like Samsung A12 (~360dp)", () => {
    const layout = getProfileVoteControlLayout(360);
    const contentWidth = getProfileScoreCardWidth(360);
    const rowWidth =
      layout.sideDiameter * 2 +
      layout.voteDiameter * 2 +
      layout.voteGap +
      layout.centerNudge;

    expect(layout.stacked).toBe(false);
    expect(rowWidth).toBeLessThanOrEqual(contentWidth);
    expect(layout.voteDiameter).toBeLessThanOrEqual(72);
  });

  it("fits very narrow content width without overlapping side buttons", () => {
    const screenWidth = PROFILE_HORIZONTAL_PADDING * 2 + 240;
    const layout = getProfileVoteControlLayout(screenWidth);
    const contentWidth = getProfileScoreCardWidth(screenWidth);

    if (!layout.stacked) {
      const rowWidth =
        layout.sideDiameter * 2 +
        layout.voteDiameter * 2 +
        layout.voteGap +
        layout.centerNudge;
      expect(rowWidth).toBeLessThanOrEqual(contentWidth);
    } else {
      expect(layout.voteGap).toBeGreaterThan(0);
      expect(layout.centerNudge).toBe(0);
    }
  });
});

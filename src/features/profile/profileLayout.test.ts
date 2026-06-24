import {
  getProfileScoreCardWidth,
  getProfileSegmentGaugeLayout,
  getProfileVoteControlLayout,
  PROFILE_HORIZONTAL_PADDING,
} from "./profileLayout";

describe("getProfileSegmentGaugeLayout", () => {
  it("scales gauge up on wide screens with clamp", () => {
    const layout = getProfileSegmentGaugeLayout(412);

    expect(layout.gaugeWidth).toBeLessThanOrEqual(240);
    expect(layout.gaugeWidth).toBeGreaterThanOrEqual(168);
    expect(layout.gaugeHeight).toBe(Math.round(layout.gaugeWidth * 0.6));
    expect(layout.containerWidth).toBe(getProfileScoreCardWidth(412));
  });

  it("adapts on Samsung A12 width (~360dp)", () => {
    const layout = getProfileSegmentGaugeLayout(360);

    expect(layout.gaugeWidth).toBeGreaterThanOrEqual(168);
    expect(layout.gaugeWidth).toBeLessThanOrEqual(layout.containerWidth);
    expect(layout.rankFontSize).toBeGreaterThanOrEqual(26);
  });

  it("respects large font scale without overflowing content", () => {
    const layout = getProfileSegmentGaugeLayout(360, 1.3);

    expect(layout.gaugeWidth).toBeLessThanOrEqual(240);
    expect(layout.rankFontSize).toBeGreaterThan(26);
  });
});

describe("getProfileVoteControlLayout", () => {
  it("uses max diameters on wide screens", () => {
    const layout = getProfileVoteControlLayout(412);

    expect(layout.stacked).toBe(false);
    expect(layout.voteDiameter).toBe(66);
    expect(layout.sideDiameter).toBe(58);
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
    expect(layout.voteDiameter).toBeLessThanOrEqual(66);
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

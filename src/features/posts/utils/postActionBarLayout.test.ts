import {
  estimatePostActionBarSingleRowMinWidth,
  getPostActionBarLayout,
} from "./postActionBarLayout";

describe("getPostActionBarLayout", () => {
  it("uses single row on wide screens", () => {
    const layout = getPostActionBarLayout(412);

    expect(layout.stacked).toBe(false);
    expect(layout.voteDiameter).toBe(44);
    expect(layout.actionLabelMaxWidth).toBe(80);
    expect(layout.voteCenterOffsetX).toBe(-47);
  });

  it("keeps vote centered with share left of Alçalt at Samsung A12 (~360dp)", () => {
    const layout = getPostActionBarLayout(360);

    expect(layout.stacked).toBe(false);
    expect(layout.voteDiameter).toBe(36);
    expect(layout.actionLabelMaxWidth).toBe(64);
    expect(layout.shareCenterOffsetX).toBeLessThan(layout.voteCenterOffsetX);
    expect(estimatePostActionBarSingleRowMinWidth(layout.voteDiameter)).toBeLessThanOrEqual(
      360
    );
  });

  it("stacks only on extremely narrow widths", () => {
    const layout = getPostActionBarLayout(260);

    expect(layout.stacked).toBe(true);
    expect(layout.voteDiameter).toBe(32);
  });
});

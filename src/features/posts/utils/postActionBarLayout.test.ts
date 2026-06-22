import { getPostActionBarLayout } from "./postActionBarLayout";

describe("getPostActionBarLayout", () => {
  it("uses single row on wide screens", () => {
    const layout = getPostActionBarLayout(412);

    expect(layout.stacked).toBe(false);
    expect(layout.voteDiameter).toBe(44);
  });

  it("stacks vote row on Samsung A12 width (~360dp)", () => {
    const layout = getPostActionBarLayout(360);

    expect(layout.stacked).toBe(true);
    expect(layout.voteDiameter).toBe(36);
  });
});

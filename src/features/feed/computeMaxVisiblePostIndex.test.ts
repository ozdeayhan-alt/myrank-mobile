import { computeMaxVisiblePostIndex } from "./computeMaxVisiblePostIndex";

describe("computeMaxVisiblePostIndex", () => {
  const postIds = ["a", "b", "c", "d", "e"];

  it("returns the highest visible post index", () => {
    expect(computeMaxVisiblePostIndex(["b", "d"], postIds)).toBe(3);
  });

  it("returns -1 when nothing is visible", () => {
    expect(computeMaxVisiblePostIndex([], postIds)).toBe(-1);
  });

  it("returns -1 when the feed is empty", () => {
    expect(computeMaxVisiblePostIndex(["a"], [])).toBe(-1);
  });
});

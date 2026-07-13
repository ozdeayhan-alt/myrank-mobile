import { feedInfiniteGetNextPageParam } from "./feedInfiniteQueryDefaults";

describe("feedInfiniteGetNextPageParam", () => {
  it("returns cursor when more pages exist", () => {
    expect(
      feedInfiniteGetNextPageParam({
        posts: [],
        cursor: "next",
        hasMore: true,
      })
    ).toBe("next");
  });

  it("returns undefined when there is no next page", () => {
    expect(
      feedInfiniteGetNextPageParam({
        posts: [],
        cursor: "next",
        hasMore: false,
      })
    ).toBeUndefined();
  });
});

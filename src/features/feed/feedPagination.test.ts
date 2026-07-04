import {
  FEED_INITIAL_PAGE_SIZE,
  FEED_NEXT_PAGE_SIZE,
  computePrefetchTriggerIndex,
  resolveFeedPageLimit,
} from "./feedPagination";

describe("resolveFeedPageLimit", () => {
  it("returns the larger initial page size for the first request", () => {
    expect(resolveFeedPageLimit(null)).toBe(FEED_INITIAL_PAGE_SIZE);
    expect(resolveFeedPageLimit(undefined)).toBe(FEED_INITIAL_PAGE_SIZE);
  });

  it("returns the standard next page size for cursor requests", () => {
    expect(resolveFeedPageLimit("cursor-abc")).toBe(FEED_NEXT_PAGE_SIZE);
  });
});

describe("computePrefetchTriggerIndex", () => {
  it("prefetches around the 14th post on a 30-post first page", () => {
    expect(computePrefetchTriggerIndex(30)).toBe(13);
  });

  it("moves the trigger toward the tail as more pages load", () => {
    expect(computePrefetchTriggerIndex(45)).toBe(28);
  });

  it("returns -1 for an empty feed", () => {
    expect(computePrefetchTriggerIndex(0)).toBe(-1);
  });
});
